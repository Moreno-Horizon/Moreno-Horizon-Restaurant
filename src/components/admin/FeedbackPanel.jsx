import React, { useState, useEffect, useMemo } from "react";
import { onSnapshot, query, orderBy, collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { Award, TrendingUp, ThumbsUp, Heart, Star as StarIcon, MessageSquare as MessageSquareIcon, Smile, Search, Trash2 } from "lucide-react";

const FeedbackPanel = React.memo(function FeedbackPanel({ db, t, lang, showToast }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [restaurantFilter, setRestaurantFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const q = query(collection(db, "feedbacks"), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // fallback if timestamp hasn't synced from server yet
          timestamp: doc.data().timestamp ? doc.data().timestamp.toDate() : new Date(),
        }));
        setFeedbacks(list);
        setLoading(false);
      } catch (error) {
        console.error("Error loading feedbacks:", error);
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, [db]);

  const handleDelete = async (id) => {
    const msg = lang === "ar" ? "هل أنت متأكد من حذف هذا التقييم؟" : "Are you sure you want to delete this rating?";
    if (!window.confirm(msg)) return;
    try {
      await deleteDoc(doc(db, "feedbacks", id));
      if (showToast) {
        showToast(lang === "ar" ? "تم حذف التقييم بنجاح" : "Rating deleted successfully");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Compute stats
  const stats = useMemo(() => {
    if (feedbacks.length === 0) {
      return { avg: 0, food: 0, service: 0, ambiance: 0, counts: [0, 0, 0, 0, 0], total: 0 };
    }
    let sum = 0, foodSum = 0, serviceSum = 0, ambianceSum = 0;
    const counts = [0, 0, 0, 0, 0]; // 5 to 1

    feedbacks.forEach((f) => {
      sum += f.rating || 0;
      foodSum += f.foodRating || 0;
      serviceSum += f.serviceRating || 0;
      ambianceSum += f.ambianceRating || 0;

      const r = Math.round(f.rating || 5);
      if (r >= 1 && r <= 5) {
        counts[5 - r] += 1;
      }
    });

    const len = feedbacks.length;
    return {
      avg: (sum / len).toFixed(1),
      food: (foodSum / len).toFixed(1),
      service: (serviceSum / len).toFixed(1),
      ambiance: (ambianceSum / len).toFixed(1),
      counts,
      total: len,
    };
  }, [feedbacks]);

  // Filter feedbacks
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((f) => {
      const matchesSearch =
        f.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        f.comment?.toLowerCase().includes(search.toLowerCase()) ||
        f.room?.toString().includes(search);

      const matchesRestaurant =
        restaurantFilter === "all" ||
        (restaurantFilter === "italian" && (f.restaurant?.includes("إيطالي") || f.resId === "italian")) ||
        (restaurantFilter === "oriental" && (f.restaurant?.includes("شرقي") || f.resId === "oriental"));

      let matchesRating = true;
      if (ratingFilter !== "all") {
        const ratingNum = parseInt(ratingFilter, 10);
        if (ratingNum === 5) matchesRating = f.rating >= 4.5;
        else if (ratingNum === 4) matchesRating = f.rating >= 3.5 && f.rating < 4.5;
        else if (ratingNum === 3) matchesRating = f.rating >= 2.5 && f.rating < 3.5;
        else if (ratingNum === 2) matchesRating = f.rating < 2.5;
      }

      return matchesSearch && matchesRestaurant && matchesRating;
    });
  }, [feedbacks, search, restaurantFilter, ratingFilter]);

  const renderStarsList = (val) => {
    const rounded = Math.round(val || 5);
    return (
      <div className="flex gap-0.5 justify-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            size={13}
            className={star <= rounded ? "fill-amber-400 text-amber-400" : "text-stone-200"}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-stone-100 mt-12 overflow-hidden animate-fade-in no-print">
      {/* Header */}
      <div className="p-8 border-b border-stone-100 bg-stone-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-brand-blue flex items-center gap-2.5">
            <Award size={24} className="text-amber-500 animate-pulse" />
            {lang === "ar" ? "نظام تقييمات وآراء العملاء" : "Customer Feedback & Reviews"}
          </h3>
          <p className="text-xs text-stone-400 font-bold mt-1">
            {lang === "ar" ? "متابعة جودة الأطباق ومستوى الخدمة لحظياً" : "Monitor food quality and service levels in real-time"}
          </p>
        </div>
        <span className="bg-amber-50 text-amber-600 px-4 py-1.5 rounded-xl text-xs font-black border border-amber-100 flex items-center gap-1.5 shadow-sm">
          <Smile size={14} />
          {lang === "ar" ? `إجمالي التقييمات: ${stats.total}` : `Total Ratings: ${stats.total}`}
        </span>
      </div>

      {loading ? (
        <div className="p-12 text-center text-stone-400 font-bold">{lang === "ar" ? "جاري تحميل التقييمات..." : "Loading ratings..."}</div>
      ) : feedbacks.length === 0 ? (
        <div className="p-16 text-center text-stone-400 font-bold">
          {lang === "ar" ? "لا توجد تقييمات مرسلة حتى الآن." : "No customer feedback submitted yet."}
        </div>
      ) : (
        <div className="p-8 space-y-8">
          {/* Top Stats Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-stone-50/50 p-6 rounded-3xl border border-stone-100">
            {/* Overall Gauge */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-stone-100 flex flex-col items-center justify-center text-center shadow-sm">
              <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider mb-2">
                {lang === "ar" ? "التقييم العام الكلي" : "Overall Average Rating"}
              </span>
              <div className="relative flex items-center justify-center mb-2">
                <p className="text-5xl font-black text-amber-500 drop-shadow-sm">{stats.avg}</p>
                <span className="text-stone-400 font-black text-xl align-super ml-0.5">/5</span>
              </div>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const filled = star <= Math.round(stats.avg);
                  return (
                    <StarIcon
                      key={star}
                      size={18}
                      className={filled ? "fill-amber-400 text-amber-400" : "text-stone-200"}
                    />
                  );
                })}
              </div>
              <p className="text-xs font-bold text-stone-400">
                {lang === "ar" ? "بناءً على تجارب النزلاء الحقيقية" : "Based on verified guest experiences"}
              </p>
            </div>

            {/* Distribution chart */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-stone-100 flex flex-col justify-center shadow-sm">
              <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider mb-4 text-center lg:text-start">
                {lang === "ar" ? "توزيع نسب النجوم" : "Rating Distribution"}
              </span>
              <div className="space-y-2">
                {stats.counts.map((count, index) => {
                  const stars = 5 - index;
                  const pct = stats.total > 0 ? ((count / stats.total) * 100).toFixed(0) : 0;
                  return (
                    <div key={stars} className="flex items-center gap-3">
                      <span className="text-xs font-black text-stone-500 w-6 flex items-center gap-0.5">
                        {stars}★
                      </span>
                      <div className="flex-grow bg-stone-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            stars >= 4 ? "bg-amber-400" : stars === 3 ? "bg-yellow-400" : "bg-red-400"
                          }`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-stone-400 w-8 text-end">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sub-categories */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-stone-100 flex flex-col justify-between shadow-sm space-y-4">
              {/* Food Quality Sub-stat */}
              <div className="flex items-center justify-between border-b border-stone-50 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-stone-600">{lang === "ar" ? "جودة الطعام" : "Food Quality"}</p>
                    {renderStarsList(stats.food)}
                  </div>
                </div>
                <span className="text-lg font-black text-stone-700">{stats.food}</span>
              </div>

              {/* Service Sub-stat */}
              <div className="flex items-center justify-between border-b border-stone-50 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                    <ThumbsUp size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-stone-600">{lang === "ar" ? "مستوى الخدمة" : "Service Quality"}</p>
                    {renderStarsList(stats.service)}
                  </div>
                </div>
                <span className="text-lg font-black text-stone-700">{stats.service}</span>
              </div>

              {/* Ambiance Sub-stat */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                    <Heart size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-stone-600">{lang === "ar" ? "الأجواء والنظافة" : "Ambiance"}</p>
                    {renderStarsList(stats.ambiance)}
                  </div>
                </div>
                <span className="text-lg font-black text-stone-700">{stats.ambiance}</span>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col xl:flex-row gap-4 items-center justify-between bg-stone-50/20 p-4 rounded-2xl border border-stone-100">
            <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
              {/* Restaurant Filter */}
              <select
                value={restaurantFilter}
                onChange={(e) => setRestaurantFilter(e.target.value)}
                className="bg-white px-4 py-2.5 rounded-xl border border-stone-200 font-bold text-stone-600 text-xs outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="all">{lang === "ar" ? "جميع المطاعم" : "All Restaurants"}</option>
                <option value="italian">{lang === "ar" ? "مطعم إيطالي" : "Italian Restaurant"}</option>
                <option value="oriental">{lang === "ar" ? "مطعم شرقي" : "Oriental Restaurant"}</option>
              </select>

              {/* Rating Filter */}
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="bg-white px-4 py-2.5 rounded-xl border border-stone-200 font-bold text-stone-600 text-xs outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="all">{lang === "ar" ? "جميع التقييمات" : "All Ratings"}</option>
                <option value="5">⭐⭐⭐⭐⭐ {lang === "ar" ? "ممتاز" : "Excellent"}</option>
                <option value="4">⭐⭐⭐⭐ {lang === "ar" ? "جيد جداً" : "Very Good"}</option>
                <option value="3">⭐⭐⭐ {lang === "ar" ? "متوسط" : "Average"}</option>
                <option value="2">⭐⭐ {lang === "ar" ? "بحاجة لتحسين" : "Needs Improvement"}</option>
              </select>
            </div>

            {/* Search */}
            <div className="relative w-full xl:w-72">
              <input
                type="text"
                placeholder={lang === "ar" ? "البحث في التعليقات أو الأسماء..." : "Search comments, names..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full bg-white px-4 py-2.5 rounded-xl outline-none border border-stone-200 text-xs font-bold focus:ring-2 focus:ring-brand-blue transition-all ${
                  t.dir === "rtl" ? "pr-9" : "pl-9"
                }`}
              />
              <Search
                size={16}
                className="absolute top-1/2 -translate-y-1/2 text-stone-400"
                style={{ [t.dir === "rtl" ? "right" : "left"]: "0.75rem" }}
              />
            </div>
          </div>

          {/* Feedback list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredFeedbacks.length === 0 ? (
              <div className="col-span-full py-12 text-center text-stone-400 font-bold border border-stone-100 rounded-3xl bg-stone-50/20">
                {lang === "ar" ? "لا توجد نتائج مطابقة لبحثك." : "No reviews match your search."}
              </div>
            ) : (
              filteredFeedbacks.map((item) => {
                const isItalian = item.restaurant?.includes("إيطالي") || item.resId === "italian";
                return (
                  <div
                    key={item.id}
                    className="bg-white p-6 rounded-3xl border border-stone-100 hover:shadow-md hover:border-amber-200/50 transition-all flex flex-col justify-between relative group"
                  >
                    {/* Header line */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h4 className="font-black text-brand-blue text-sm">
                          {item.customerName} <span className="text-stone-400 text-xs font-medium">(Room {item.room})</span>
                        </h4>
                        <span className="text-[10px] text-stone-400 font-bold block mt-0.5">
                          {item.timestamp?.toLocaleString(lang === "ar" ? "ar-EG" : "en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border tracking-wider ${
                          isItalian
                            ? "bg-blue-50 text-blue-600 border-blue-100"
                            : "bg-orange-50 text-orange-600 border-orange-100"
                        }`}
                      >
                        {isItalian ? (lang === "ar" ? "إيطالي" : "Italian") : (lang === "ar" ? "شرقي" : "Oriental")}
                      </span>
                    </div>

                    {/* Ratings row breakdown */}
                    <div className="bg-stone-50/50 p-3 rounded-xl border border-stone-100/50 mb-3 grid grid-cols-2 gap-2 text-[10px] font-bold text-stone-500">
                      <div className="flex items-center justify-between">
                        <span>{lang === "ar" ? "العام:" : "Overall:"}</span>
                        {renderStarsList(item.rating)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{lang === "ar" ? "الطعام:" : "Food:"}</span>
                        {renderStarsList(item.foodRating)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{lang === "ar" ? "الخدمة:" : "Service:"}</span>
                        {renderStarsList(item.serviceRating)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{lang === "ar" ? "الأجواء:" : "Ambiance:"}</span>
                        {renderStarsList(item.ambianceRating)}
                      </div>
                    </div>

                    {/* Comment text */}
                    {item.comment ? (
                      <div className="bg-stone-50/30 p-3.5 rounded-xl border border-dashed border-stone-200/60 text-xs text-stone-600 leading-relaxed font-semibold italic flex gap-2 items-start relative mt-1 flex-grow">
                        <MessageSquareIcon size={14} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="flex-grow">&ldquo;{item.comment}&rdquo;</p>
                      </div>
                    ) : (
                      <div className="text-stone-300 text-xs font-bold italic flex-grow flex items-center justify-center p-3">
                        {lang === "ar" ? "لا توجد ملاحظات مكتوبة" : "No written comments"}
                      </div>
                    )}

                    {/* Trash Delete Action */}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      style={{ transitionDelay: "50ms" }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default FeedbackPanel;
