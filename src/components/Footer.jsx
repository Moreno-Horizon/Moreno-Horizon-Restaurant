import { memo } from "react";

const Footer = memo(({ t, setView }) => {
  return (
    <footer className="bg-brand-dark text-stone-400 py-5 border-t-[2px] border-brand-blue text-center relative overflow-hidden">
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div
          className="bg-white/95 inline-flex items-center justify-center px-3 py-2 rounded-xl shadow-md cursor-pointer hover:scale-105 transition-transform"
          onClick={() => setView("admin")}
        >
          <img
            src="/logo.webp"
            alt="Moreno SPA & RESORT"
            className="h-10 w-auto object-contain"
          />
        </div>

        <div className="opacity-30 text-[7px] uppercase tracking-widest">
          © {new Date().getFullYear()} Moreno Horizon SPA & RESORT
        </div>
        <div className="opacity-50 text-[7px] text-brand-orange font-bold uppercase tracking-widest animate-pulse">
          {t.designedBy}
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

export default Footer;
