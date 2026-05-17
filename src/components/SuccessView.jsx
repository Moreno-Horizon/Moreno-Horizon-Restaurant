import { memo, useEffect, useState } from "react";
import { CheckCircle, ArrowRight, Star } from "lucide-react";

const CONFETTI_COLORS = ["#34E0A1", "#f97316", "#3b82f6", "#ec4899", "#eab308", "#a855f7"];
const CONFETTI_SHAPES = ["circle", "square", "ribbon"];

const ConfettiEmitter = memo(() => {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    // Generate 55 elegant falling confetti flakes distributed instantly
    const list = Array.from({ length: 55 }).map((_, i) => {
      const size = Math.random() * 8 + 6; // size between 6px and 14px
      const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      const shape = CONFETTI_SHAPES[Math.floor(Math.random() * CONFETTI_SHAPES.length)];
      const left = Math.random() * 100;
      const delay = Math.random() * -6; // start instantly pre-scattered!
      const duration = Math.random() * 4 + 4; // falling duration between 4s and 8s
      const sway = Math.random() * 60 - 30; // sideways sway offset
      return {
        id: i,
        size,
        color,
        shape,
        left,
        delay,
        duration,
        sway,
      };
    });
    setPieces(list);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20 select-none">
      <style>{`
        @keyframes fall-confetti {
          0% {
            transform: translateY(-5vh) rotate(0deg) translateX(0);
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(105vh) rotate(720deg) translateX(var(--sway-offset));
            opacity: 0;
          }
        }
        .confetti-flake {
          position: absolute;
          top: -20px;
          animation: fall-confetti linear infinite;
          will-change: transform;
        }
      `}</style>
      {pieces.map((p) => {
        let rounded = "rounded-none";
        if (p.shape === "circle") rounded = "rounded-full";
        if (p.shape === "ribbon") rounded = "rounded-b-md rounded-t-sm";

        const width = p.shape === "ribbon" ? "5px" : `${p.size}px`;
        const height = p.shape === "ribbon" ? "18px" : `${p.size}px`;

        return (
          <div
            key={p.id}
            className={`confetti-flake ${rounded}`}
            style={{
              width,
              height,
              backgroundColor: p.color,
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              "--sway-offset": `${p.sway}px`,
            }}
          />
        );
      })}
    </div>
  );
});

ConfettiEmitter.displayName = "ConfettiEmitter";

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
      {/* Confetti celebration rain effect */}
      <ConfettiEmitter />

      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-105"
        style={{ backgroundImage: 'url("/images/moreno_spa_resort.webp")' }}
      >
        <div className="absolute inset-0 bg-brand-blue/60 backdrop-blur-sm"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 md:p-12 rounded-[3rem] shadow-2xl flex flex-col items-center text-center overflow-y-auto max-h-[90vh] custom-scrollbar animate-scale-in">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-[#34E0A1] blur-[40px] opacity-30 animate-pulse"></div>
          {/* Elastic bounce spring effect on green check circle badge */}
          <CheckCircle size={80} className="text-[#34E0A1] relative z-10 animate-elastic-bounce" />
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
