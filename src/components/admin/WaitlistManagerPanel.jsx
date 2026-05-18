import React from "react";
import { Sparkles, CheckCircle, Users } from "lucide-react";

const WaitlistManagerPanel = ({
  lang,
  waitlistBookings,
  settings,
  getOccupancy,
  currentUser,
  db,
  showToast,
  findAvailableTable,
  updateDoc,
  doc,
  serverTimestamp
}) => {
  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-stone-100 relative overflow-hidden animate-fade-in mb-8">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-brand-orange"></div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="text-xl font-black text-brand-blue flex items-center gap-2">
            <Sparkles className="text-amber-500 animate-pulse" size={24} />
            <span>{lang === "ar" ? "نظام الانتظار الذكي" : "Smart Waitlist Manager"}</span>
            <span className="ms-2 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-xl text-xs font-black shadow-sm">
              {waitlistBookings.length} {lang === "ar" ? "في الانتظار" : "Waiting"}
            </span>
          </h3>
          <p className="text-stone-400 text-xs mt-1 font-bold">
            {lang === "ar" 
              ? "قم بترقية الحجوزات فوراً عند توفر طاولات شاغرة لضمان الإشغال الكامل" 
              : "Instantly upgrade reservations when tables open up to ensure maximum occupancy"}
          </p>
        </div>
      </div>

      {waitlistBookings.length === 0 ? (
        <div className="text-center py-12 px-4 bg-stone-50/50 rounded-[1.5rem] border border-dashed border-stone-200">
          <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <CheckCircle size={32} />
          </div>
          <p className="font-bold text-stone-600 text-base">
            {lang === "ar" 
              ? "قائمة الانتظار فارغة حالياً. جميع الضيوف لديهم حجوزات مؤكدة! 🎉" 
              : "The waitlist is currently empty. All guests have confirmed bookings! 🎉"}
          </p>
          <p className="text-xs text-stone-400 mt-1 font-bold">
            {lang === "ar" ? "طاولةك مستغلة بشكل مثالي ومباشر." : "Your tables are perfectly utilized."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {waitlistBookings.map((b) => {
            // Determine capacity for this waitlisted booking
            const maxCap = b.resId === "italian" 
              ? (settings.capacityItalian || 80) 
              : (settings.capacityOriental || 30);
            
            const currentOccupancy = getOccupancy(b.date, b.resId, b.resId === "italian" ? b.time : null);
            const remainingSeats = Math.max(0, maxCap - currentOccupancy);
            const requestedGuests = Number(b.guests || 1);
            const hasCapacity = remainingSeats >= requestedGuests;

            return (
              <div 
                key={b.id} 
                className="group relative bg-stone-50/40 hover:bg-white p-5 rounded-3xl border border-stone-100 hover:border-amber-400/50 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden"
              >
                {/* Background accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-orange/10 transition-all duration-500"></div>
                
                <div>
                  {/* Ticket Header */}
                  <div className="flex justify-between items-start gap-2 mb-4">
                    <div>
                      <h4 className="font-black text-brand-blue text-base leading-tight group-hover:text-brand-orange transition-colors">
                        {b.name}
                      </h4>
                      <span className="text-stone-400 font-bold text-xs mt-1 block" dir="ltr">
                        {b.phone}
                      </span>
                    </div>
                    <span className="bg-amber-500/10 text-brand-orange px-3 py-1.5 rounded-2xl text-xs font-black shrink-0 shadow-sm flex items-center gap-1">
                      <Users size={12} />
                      {b.guests} {lang === "ar" ? "أفراد" : "PAX"}
                    </span>
                  </div>

                  {/* Info lines */}
                  <div className="space-y-2 text-xs font-bold text-stone-600 mb-5 relative z-10">
                    <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-stone-100/50">
                      <span className="text-stone-400">{lang === "ar" ? "رقم الغرفة:" : "Room:"}</span>
                      <span className="text-brand-blue font-black bg-brand-orange/5 px-2 py-0.5 rounded-lg">{b.room}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-stone-100/50">
                      <span className="text-stone-400">{lang === "ar" ? "المطعم:" : "Restaurant:"}</span>
                      <span className="text-stone-800">{b.restaurant}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-stone-100/50">
                      <span className="text-stone-400">{lang === "ar" ? "التاريخ والوقت:" : "Date & Time:"}</span>
                      <span className="text-stone-800">
                        {b.date} <span className="text-brand-orange">({b.time || "19:00 - 20:00"})</span>
                      </span>
                    </div>
                  </div>

                  {/* Live capacity helper */}
                  <div className="mb-5 p-3 rounded-2xl border bg-white flex flex-col gap-1.5 text-[11px] font-bold shadow-sm">
                    <div className="flex justify-between text-stone-500">
                      <span>{lang === "ar" ? "المقاعد المتبقية:" : "Remaining seats:"}</span>
                      <span className={remainingSeats > 0 ? "text-green-600 font-black" : "text-red-500 font-black"}>
                        {remainingSeats} {lang === "ar" ? "مقعد" : "seats"}
                      </span>
                    </div>
                    {hasCapacity ? (
                      <span className="text-green-600 flex items-center gap-1 bg-green-50/50 px-2.5 py-1 rounded-xl text-[10px]">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        {lang === "ar" ? "يتوفر سعة كافية للترقية الفورية" : "Sufficient capacity available for upgrade"}
                      </span>
                    ) : (
                      <span className="text-red-500 flex items-center gap-1 bg-red-50/50 px-2.5 py-1 rounded-xl text-[10px]">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        {lang === "ar" ? "السعة غير كافية (يتطلب تجاوز الحد)" : "Capacity full (requires limit override)"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Instant Upgrade Button */}
                <button
                  onClick={async () => {
                    try {
                      const updateData = {
                        status: "confirmed",
                        updatedBy: currentUser?.name || "Admin",
                        updatedAt: serverTimestamp(),
                      };
                      if (!b.tableNo) {
                        const autoTable = findAvailableTable(b.date, b.resId, b.time, b.guests);
                        if (autoTable) {
                          updateData.tableNo = autoTable;
                        }
                      }
                      await updateDoc(
                        doc(db, "bookings", b.id.toString()),
                        updateData
                      );
                      showToast(
                        lang === "ar"
                          ? `تم ترقية وتأكيد حجز الضيف: ${b.name} بنجاح! 🎉`
                          : `Upgraded and confirmed booking for: ${b.name} successfully! 🎉`
                      );
                    } catch (err) {
                      console.error("Error upgrading waitlist booking:", err);
                    }
                  }}
                  className="w-full bg-gradient-to-r from-amber-500 to-brand-orange hover:from-amber-600 hover:to-brand-orangeHover text-white py-3 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 transform active:scale-95 cursor-pointer border border-brand-orange/10"
                >
                  <Sparkles size={16} className="animate-spin-slow" />
                  <span>{lang === "ar" ? "ترقية فوري ✨" : "Instant Upgrade ✨"}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WaitlistManagerPanel;
