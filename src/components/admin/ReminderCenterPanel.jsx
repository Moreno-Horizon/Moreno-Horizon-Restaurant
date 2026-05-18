import React from "react";
import { BellRing, CheckCircle, Send } from "lucide-react";

const ReminderCenterPanel = ({
  lang,
  notificationPermission,
  requestNotificationPermission,
  upcomingReminders,
  getBookingStartMs,
  sendReminder
}) => {
  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-stone-100 relative overflow-hidden animate-fade-in mb-8 no-print">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 via-brand-orange to-brand-blue"></div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="text-xl font-black text-brand-blue flex items-center gap-2">
            <BellRing className="text-brand-orange animate-bounce" size={24} />
            <span>{lang === "ar" ? "مركز التذكير التلقائي للنزلاء" : "Automated Guest Reminder Center"}</span>
            <span className="ms-2 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-xl text-xs font-black shadow-sm flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              {lang === "ar" ? "نشط حالياً ⚡" : "Active ⚡"}
            </span>
          </h3>
          <p className="text-stone-400 text-xs mt-1 font-bold">
            {lang === "ar" 
              ? "تنبيهات وتذكيرات تلقائية تُرسل للنزلاء قبل موعد الحجز بساعة لتقليل نسبة التغيب (No-Show)" 
              : "Automatic alerts and WhatsApp templates triggered 1 hour before reservation to prevent no-shows"}
          </p>
        </div>

        {/* Notification Permission Quick Action */}
        <button
          onClick={requestNotificationPermission}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
            notificationPermission === "granted"
              ? "bg-green-50 text-green-600 border border-green-200"
              : "bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 animate-pulse"
          }`}
        >
          <span>🔔</span>
          <span>
            {notificationPermission === "granted"
              ? (lang === "ar" ? "إشعارات المتصفح مفعّلة" : "Browser Alerts Active")
              : (lang === "ar" ? "تفعيل إشعارات المتصفح" : "Enable Browser Alerts")}
          </span>
        </button>
      </div>

      {upcomingReminders.length === 0 ? (
        <div className="text-center py-10 px-4 bg-emerald-50/20 rounded-[1.5rem] border border-emerald-100">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
            <CheckCircle size={28} className="animate-pulse" />
          </div>
          <p className="font-black text-emerald-800 text-sm">
            {lang === "ar" 
              ? "رائع! جميع النزلاء القادمين خلال الساعتين القادمتين تم تذكيرهم بنجاح! 🎉" 
              : "Awesome! All guests arriving within the next 2 hours have been reminded! 🎉"}
          </p>
          <p className="text-[10px] text-emerald-600 mt-1 font-bold">
            {lang === "ar" ? "معدل الحضور مستقر ومضمون بنسبة 100%." : "Attendance rate is secured and highly optimized."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingReminders.map((b) => {
            const startMs = getBookingStartMs(b.date, b.time);
            const diffMin = startMs ? Math.round((startMs - Date.now()) / 60000) : 0;
            
            return (
              <div 
                key={b.id} 
                className="bg-stone-50 border border-stone-200 hover:border-brand-orange/40 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group flex flex-col justify-between"
              >
                {/* Glowing Accent line inside card */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-orange/60"></div>
                
                <div>
                  {/* Booking Tag */}
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span className="bg-white text-stone-600 px-2.5 py-1 rounded-lg text-[9px] font-black border border-stone-100 uppercase tracking-wider inline-block">
                      {b.restaurant && b.restaurant.includes("La Mama") 
                        ? "🇮🇹 La Mama" 
                        : "🇪🇬 Aseel"}
                    </span>
                    
                    {/* Countdown Pill */}
                    <span className="bg-amber-50 text-amber-600 text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-inner animate-pulse">
                      <span>⏰</span>
                      <span>
                        {lang === "ar" 
                          ? `يبدأ خلال ${diffMin} د` 
                          : `Starts in ${diffMin}m`}
                      </span>
                    </span>
                  </div>

                  {/* Guest Details */}
                  <h4 className="text-stone-800 font-black text-sm group-hover:text-brand-orange transition-colors">
                    {b.name}
                  </h4>
                  <p className="text-stone-400 text-xs font-bold mt-1 flex items-center gap-1.5">
                    <span>🏢 {lang === "ar" ? `غرفة ${b.room}` : `Room ${b.room}`}</span>
                    <span>•</span>
                    <span>👥 {b.guests} {lang === "ar" ? "أفراد" : "PAX"}</span>
                  </p>

                  <p className="text-stone-600 text-xs font-black mt-2 bg-white/80 p-2 rounded-xl border border-stone-100 flex items-center gap-1">
                    <span>🕒</span>
                    <span>{lang === "ar" ? `موعد الحجز: ${b.time}` : `Reserved at: ${b.time}`}</span>
                  </p>
                </div>

                {/* Notification trigger button */}
                <div className="mt-5">
                  <button
                    onClick={() => sendReminder(b)}
                    className="w-full bg-brand-orange hover:bg-brand-orangeHover text-white py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-orange/10 cursor-pointer"
                  >
                    <Send size={12} className="animate-pulse" />
                    {lang === "ar" ? "إرسال تذكير WhatsApp ⏰" : "Send WhatsApp Reminder ⏰"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default React.memo(ReminderCenterPanel);
