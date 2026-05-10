import React, { useState, useEffect } from "react";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Star, MessageSquare, Shield, Sparkles, HeartHandshake } from "lucide-react";

export default function FeedbackView({ lang, db, showToast, setView, t = {} }) {
  const [bookingId, setBookingId] = useState("");
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Ratings state
  const [rating, setRating] = useState(5);
  const [foodRating, setFoodRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [ambianceRating, setAmbianceRating] = useState(5);
  const [comment, setComment] = useState("");

  // Hover states for visual stars feedback
  const [hoverRating, setHoverRating] = useState(0);
  const [hoverFood, setHoverFood] = useState(0);
  const [hoverService, setHoverService] = useState(0);
  const [hoverAmbiance, setHoverAmbiance] = useState(0);

  useEffect(() => {
    // Get booking ID from URL query params
    const params = new URLSearchParams(window.location.search);
    const id = params.get("bookingId") || params.get("id");
    if (id) {
      setBookingId(id);
      fetchBookingDetails(id);
    }
  }, []);

  const fetchBookingDetails = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const docRef = doc(db, "bookings", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBooking({ id: docSnap.id, ...data });
      } else {
        showToast(
          t.feedbackNotFound || (lang === "ar" 
            ? "عذراً، لم نتمكن من العثور على بيانات هذا الحجز." 
            : "Sorry, booking details could not be found."),
          4000
        );
      }
    } catch (err) {
      console.error("Error fetching booking details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!booking) {
      showToast(
        t.verifyRefFirst || (lang === "ar"
          ? "الرجاء التأكد من رقم الحجز أولاً"
          : "Please verify your booking reference first"),
        4000
      );
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "feedbacks"), {
        bookingId: booking.id,
        customerName: booking.name || "Guest",
        room: booking.room || "N/A",
        restaurant: booking.restaurant || "N/A",
        resId: booking.resId || "N/A",
        rating: Number(rating),
        foodRating: Number(foodRating),
        serviceRating: Number(serviceRating),
        ambianceRating: Number(ambianceRating),
        comment: comment.trim(),
        timestamp: serverTimestamp(),
      });

      setSuccess(true);
      showToast(
        t.feedbackSuccess || (lang === "ar"
          ? "نشكرك جزيل الشكر على تقييمك لمساعدتنا في تقديم خدمة تليق بك! 🌟"
          : "Thank you so much for your rating! 🌟"),
        5000
      );
    } catch (err) {
      console.error("Error saving feedback:", err);
      showToast(t.errorFeedback || (lang === "ar" ? "حدث خطأ أثناء إرسال التقييم" : "Error submitting feedback"), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (currentVal, setter, hoverVal, setHover) => {
    return (
      <div className="flex gap-2.5 justify-center mt-2">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= (hoverVal || currentVal);
          return (
            <button
              key={star}
              type="button"
              onClick={() => setter(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="focus:outline-none transform hover:scale-125 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <Star
                size={34}
                className={`transition-all ${
                  filled
                    ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                    : "text-stone-200 hover:text-amber-200"
                }`}
              />
            </button>
          );
        })}
      </div>
    );
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 animate-fade-in">
        <div className="bg-white/80 backdrop-blur-xl p-10 md:p-14 rounded-[2.5rem] shadow-2xl border border-stone-100 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-amber-400 via-brand-orange to-brand-blue"></div>
          <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce shadow-inner">
            <Sparkles size={46} className="text-amber-500 animate-pulse" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-black text-stone-800 tracking-tight leading-tight mb-4">
            {t.feedbackThankYou || (lang === "ar" ? "شكراً جزيلاً لتقييمك!" : "Thank You For Your Feedback!")}
          </h2>
          <p className="text-stone-500 text-sm md:text-base leading-relaxed mb-8 max-w-sm mx-auto font-medium">
            {t.feedbackThankYouDesc || (lang === "ar"
              ? "ملاحظاتك القيمة تساعد فريق عمل Moreno Horizon في تحسين جودة الأطباق ومستوى الخدمة لنقدم لك دائماً تجربة لا تُنسى."
              : "Your valuable comments help the Moreno Horizon team improve food and service quality to always provide you with an unforgettable experience.")}
          </p>

          <button
            onClick={() => setView("home")}
            className="w-full sm:w-auto bg-gradient-to-r from-brand-orange to-brand-blue text-white px-10 py-4 rounded-2xl font-black text-sm tracking-wide shadow-xl shadow-brand-orange/20 hover:scale-102 transition-all cursor-pointer"
          >
            {t.backToHome || (lang === "ar" ? "العودة للرئيسية" : "Back to Home")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 animate-fade-in">
      <div className="bg-white/90 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-stone-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-amber-400 via-brand-orange to-brand-blue"></div>
        
        {/* Header */}
        <div className="text-center mb-10">
          <span className="bg-amber-50 text-amber-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 mb-3 shadow-sm">
            <HeartHandshake size={14} /> {t.serviceSurvey || (lang === "ar" ? "استبيان الخدمة" : "Service Survey")}
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-stone-800 tracking-tight">
            {t.rateDining || (lang === "ar" ? "تقييم تجربة العشاء" : "Rate Your Dining Experience")}
          </h2>
          <p className="text-stone-400 text-xs md:text-sm mt-2 font-medium">
            {t.feedbackDesc || (lang === "ar"
              ? "يسعدنا معرفة تقييمك وتجربتك معنا لمطاعمنا الفاخرة."
              : "We would love to hear about your experience with our luxury dining.")}
          </p>
        </div>

        {/* Search for Booking Id if not passed directly */}
        {!booking && (
          <div className="bg-stone-50/50 p-6 rounded-2xl border border-stone-100 mb-8 text-center shadow-inner">
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
              {t.verifyRef || (lang === "ar" ? "أدخل رقم الحجز للتقييم" : "Enter Booking Reference to Rate")}
            </label>
            <div className="flex gap-3 max-w-md mx-auto">
              <input
                type="text"
                placeholder={t.verifyRefPlaceholder || (lang === "ar" ? "رقم مرجع الحجز" : "Booking reference ID")}
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                className="flex-grow bg-white px-4 py-3.5 rounded-xl border border-stone-200 font-bold text-stone-700 outline-none focus:ring-2 focus:ring-brand-blue text-sm transition-all"
              />
              <button
                type="button"
                onClick={() => fetchBookingDetails(bookingId)}
                disabled={loading}
                className="bg-brand-blue text-white px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-md hover:scale-102 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? "..." : t.verify || (lang === "ar" ? "تحقق" : "Verify")}
              </button>
            </div>
          </div>
        )}

        {booking && (
          <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
            {/* Booking Summary */}
            <div className="bg-stone-50/50 p-6 rounded-2xl border border-stone-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-black text-stone-400 block">
                  {t.bookingName || (lang === "ar" ? "صاحب الحجز" : "Reservation Holder")}
                </span>
                <span className="text-base font-black text-stone-800 block">
                  {booking.name} (Room {booking.room})
                </span>
                <span className="text-xs font-bold text-stone-500 block">
                  {booking.restaurant} • {booking.date} @ {booking.time}
                </span>
              </div>
              <span className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-brand-blue/10 text-brand-blue border border-brand-blue/10">
                {booking.restaurant.includes("إيطالي") || booking.resId === "italian"
                  ? (t.italian || (lang === "ar" ? "مطعم إيطالي" : "Italian Restaurant"))
                  : (t.oriental || (lang === "ar" ? "مطعم شرقي" : "Oriental Restaurant"))}
              </span>
            </div>

            {/* Star Rating Matrix */}
            <div className="space-y-6">
              {/* Overall Rating */}
              <div className="bg-stone-50/20 p-5 rounded-2xl border border-stone-100 text-center shadow-sm">
                <span className="text-xs font-black text-stone-500 uppercase tracking-wider block mb-1">
                  {t.overallExp || (lang === "ar" ? "1. التقييم العام للتجربة" : "1. Overall Dining Experience")}
                </span>
                <p className="text-[10px] text-stone-400 mb-2">
                  {t.overallExpDesc || (lang === "ar" ? "كيف كانت تجربتك الكلية معنا اليوم؟" : "How was your overall experience with us today?")}
                </p>
                {renderStars(rating, setRating, hoverRating, setHoverRating)}
              </div>

              {/* Grid of Sub-ratings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Food Quality */}
                <div className="bg-stone-50/20 p-4 rounded-xl border border-stone-100 text-center shadow-sm">
                  <span className="text-xs font-black text-stone-500 uppercase tracking-wider block mb-1">
                    {t.foodQuality || (lang === "ar" ? "جودة الطعام" : "Food Quality")}
                  </span>
                  {renderStars(foodRating, setFoodRating, hoverFood, setHoverFood)}
                </div>

                {/* Service Quality */}
                <div className="bg-stone-50/20 p-4 rounded-xl border border-stone-100 text-center shadow-sm">
                  <span className="text-xs font-black text-stone-500 uppercase tracking-wider block mb-1">
                    {t.serviceQuality || (lang === "ar" ? "مستوى الخدمة" : "Service Quality")}
                  </span>
                  {renderStars(serviceRating, setServiceRating, hoverService, setHoverService)}
                </div>

                {/* Ambiance Quality */}
                <div className="bg-stone-50/20 p-4 rounded-xl border border-stone-100 text-center shadow-sm">
                  <span className="text-xs font-black text-stone-500 uppercase tracking-wider block mb-1">
                    {t.ambianceQuality || (lang === "ar" ? "النظافة والأجواء" : "Ambiance & Cleanliness")}
                  </span>
                  {renderStars(ambianceRating, setAmbianceRating, hoverAmbiance, setHoverAmbiance)}
                </div>
              </div>
            </div>

            {/* Comment Section */}
            <div className="space-y-2">
              <label className="text-xs font-black text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare size={14} className="text-brand-orange" />
                {t.commentsOrSug || (lang === "ar" ? "ملاحظاتك الإضافية أو مقترحاتك" : "Additional Comments or Suggestions")}
              </label>
              <textarea
                placeholder={
                  t.commentsPlaceholder || (lang === "ar"
                    ? "يرجى كتابة رأيك في الخدمة، جودة الطعام، أو أي شيء تود تحسينه..."
                    : "Please write your feedback about service, food quality, or anything you'd like to improve...")
                }
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-stone-50/50 p-4 rounded-xl border border-stone-200 font-bold text-stone-700 outline-none focus:ring-2 focus:ring-brand-blue text-sm transition-all shadow-inner"
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-brand-orange to-brand-blue text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wide shadow-xl shadow-brand-orange/20 hover:scale-102 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? (
                "..."
              ) : (
                <>
                  <Shield size={16} />
                  {t.submitFeedback || (lang === "ar" ? "إرسال التقييم بأمان" : "Submit Feedback Safely")}
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
