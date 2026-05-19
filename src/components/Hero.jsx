import { memo } from "react";
import { ArrowRight } from "lucide-react";

const Hero = memo(({ t, setView }) => {
  return (
    <div>
      <div className="relative min-h-[100dvh] flex items-center justify-center text-center text-white px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 z-10" />
        <img
          src="/hero-bg.webp"
          className="absolute inset-0 w-full h-full object-cover scale-105 animate-[pulse_20s_ease-in-out_infinite_alternate]"
          decoding="async"
        />
        <div
          className="relative z-20 max-w-4xl animate-slide-down py-6"
        >
          {/* La Mama Branding */}
          <div className="mb-10 flex flex-col items-center">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-[1px] w-8 bg-brand-orange/60"></div>
              <span className="text-brand-orange uppercase tracking-[0.4em] text-[10px] md:text-xs font-bold">
                {t.experience}
              </span>
              <div className="h-[1px] w-8 bg-brand-orange/60"></div>
            </div>
            <h1 className="text-7xl md:text-9xl font-serif text-white drop-shadow-2xl tracking-tighter italic">
              La <span className="text-brand-orange not-italic">Mama</span>
            </h1>
            <div className="mt-2 text-stone-300/80 text-[10px] md:text-xs uppercase tracking-[0.6em] font-light">
              {t.cuisine}
            </div>
          </div>

          <h2 className="text-3xl md:text-5xl font-serif text-white mb-3 font-bold drop-shadow-lg">
            {t.dearGuest}
          </h2>
          <p className="text-xl md:text-3xl text-stone-100 mb-2 leading-relaxed font-medium drop-shadow-md">
            {t.informMsg}
          </p>
          <strong className="text-brand-orange font-black text-3xl md:text-5xl block my-3 uppercase tracking-widest drop-shadow-2xl">
            {t.reservationInfo}
          </strong>
          <p className="text-xl md:text-3xl text-stone-100 mb-2 leading-relaxed font-bold drop-shadow-md">
            {t.reservationTime}
          </p>
          <p className="text-xl md:text-3xl text-stone-100 mb-4 leading-relaxed font-bold drop-shadow-md">
            {t.reservationPlace}
          </p>
          <div className="w-24 h-1 bg-brand-orange/50 mx-auto my-4 rounded-full"></div>
          <p className="text-xl md:text-2xl text-white italic font-serif drop-shadow-lg mb-6">
            {t.wishMsg}
          </p>
          <button
            onClick={() => setView("book")}
            className="group relative inline-flex items-center justify-center px-12 py-5 font-black text-white transition-all duration-300 ease-in-out bg-brand-orange rounded-full hover:bg-brand-orangeHover hover:scale-105 hover:shadow-[0_10px_40px_-10px_rgba(255,167,38,0.5)] active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-3 uppercase tracking-widest">
              {t.bookNow}
              <ArrowRight className={`w-6 h-6 transition-transform duration-300 group-hover:translate-x-2 ${t.dir === 'rtl' ? 'rotate-180' : ''}`} />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
});

Hero.displayName = "Hero";

export default Hero;
