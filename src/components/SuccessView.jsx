import { memo } from "react";
import { CheckCircle, ArrowRight, Star } from "lucide-react";

const SuccessView = memo(({ t, setView }) => {
  const reviews = [
    {
      name: "TripAdvisor",
      url: "https://www.tripadvisor.com/UserReviewEdit-g297549-d27425616-Moreno_Horizon_Spa_and_Resort-Hurghada_Red_Sea_and_Sinai.html",
      color: "bg-[#34E0A1]",
      icon: <Star className="w-5 h-5 fill-black" />,
      textColor: "text-black",
      desc: "Share your experience globally"
    },
    {
      name: "HolidayCheck",
      url: "https://www.holidaycheck.de/wcf/hotelreview/contribution/7fa36473-5631-3a1f-a5aa-a3c36b205548",
      color: "bg-[#003C7E]",
      icon: <div className="w-5 h-5 flex items-center justify-center font-black text-xs text-white">H</div>,
      textColor: "text-white",
      desc: "Bewerten Sie uns auf Deutsch"
    },
    {
      name: "TopHotels",
      url: "https://tophotels.ru/hotel/al4892/review/add",
      color: "bg-[#E31E24]",
      icon: <div className="w-5 h-5 flex items-center justify-center font-black text-xs text-white">T</div>,
      textColor: "text-white",
      desc: "Оставьте отзыв на русском"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 overflow-hidden animate-fade-in">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-105"
        style={{ backgroundImage: 'url("/images/moreno_spa_resort.webp")' }}
      >
        <div className="absolute inset-0 bg-brand-blue/60 backdrop-blur-sm"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 md:p-12 rounded-[3rem] shadow-2xl flex flex-col items-center text-center overflow-y-auto max-h-[90vh] custom-scrollbar">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-[#34E0A1] blur-[40px] opacity-30 animate-pulse"></div>
          <CheckCircle size={80} className="text-[#34E0A1] relative z-10 animate-scale-in" />
        </div>

        <h2 className="text-3xl md:text-5xl font-serif text-white mb-4 drop-shadow-lg">
          {t.success}
        </h2>
        <p className="text-stone-200 font-medium mb-10 max-w-md mx-auto leading-relaxed text-sm md:text-base">
          {t.successMsg}
        </p>

        <div className="w-full space-y-4 mb-10">
          <h3 className="text-[10px] font-black text-stone-300 uppercase tracking-[0.4em] mb-4">
            {t.reviewUs}
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {reviews.map((rev) => (
              <a
                key={rev.name}
                href={rev.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${rev.color} p-5 rounded-2xl flex items-center justify-between hover:scale-[1.02] active:scale-95 transition-all shadow-lg group`}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm group-hover:rotate-12 transition-transform">
                    {rev.icon}
                  </div>
                  <div className="text-left">
                    <span className={`${rev.textColor} block font-black text-base`}>
                      {rev.name}
                    </span>
                    <span className={`${rev.textColor} opacity-60 text-[9px] font-bold uppercase tracking-wider`}>
                      {rev.desc}
                    </span>
                  </div>
                </div>
                <ArrowRight className={`${rev.textColor} opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
              </a>
            ))}
          </div>
        </div>

        <button
          onClick={() => setView("home")}
          className="bg-brand-orange text-white px-12 py-4 rounded-2xl font-black text-lg hover:bg-brand-orangeHover hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-3"
        >
          {t.home}
        </button>
      </div>
    </div>
  );
});

SuccessView.displayName = "SuccessView";

export default SuccessView;
