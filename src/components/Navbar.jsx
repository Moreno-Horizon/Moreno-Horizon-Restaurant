import { memo, useState } from "react";
import {
  Menu,
  X,
  ArrowRight,
  Sun,
  Moon,
  ShoppingBag,
  Globe,
  Home,
  Utensils,
  Search,
  Lock,
  ChevronDown,
  Calendar,
} from "lucide-react";
import MorenoLogo from "./MorenoLogo";

const Navbar = memo(({
  view,
  setView,
  isSidebarOpen,
  isMenuOpen,
  setIsMenuOpen,
  isDarkMode,
  setIsDarkMode,
  setIsCartOpen,
  cart,
  lang,
  setLang,
  isLangOpen,
  setIsLangOpen,
  translations,
  t,
}) => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[80] transition-all duration-500 ${isSidebarOpen ? "opacity-0" : "opacity-100"} ${view === "home" ? "bg-transparent" : "glass border-b border-stone-200/50 shadow-sm"}`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center h-16 md:h-20">
          {/* Left: Nav Links / Back Button */}
          <div className="flex-1 flex items-center justify-start gap-4">
            {view !== "home" && view !== "admin" ? (
              <button
                onClick={() => setView("home")}
                className="flex items-center gap-2 bg-stone-100 hover:bg-brand-orange hover:text-white text-brand-blue px-4 py-2 rounded-full transition-all active:scale-95 group shadow-sm border border-stone-200/50"
              >
                <ArrowRight
                  size={18}
                  className={t.dir === "rtl" ? "rotate-0" : "rotate-180"}
                />
                <span className="font-bold text-xs uppercase tracking-wider">
                  {t.back}
                </span>
              </button>
            ) : (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden text-stone-600 hover:text-brand-blue transition-colors p-2"
              >
                {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            )}

            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => setView("home")}
                className={`text-[11px] tracking-[0.2em] uppercase font-black transition-all relative ${view === "home" ? "text-brand-orange" : "text-stone-500 hover:text-brand-blue dark:text-stone-400"}`}
              >
                {t.home}
                {view === "home" && (
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-brand-orange rounded-full animate-fade-in"></div>
                )}
              </button>

              {/* Booking Dropdown */}
              <div 
                className="relative h-full flex items-center"
                onMouseEnter={() => setIsBookingOpen(true)}
                onMouseLeave={() => setIsBookingOpen(false)}
              >
                <button
                  className={`text-[11px] tracking-[0.2em] uppercase font-black transition-all relative flex items-center gap-1 ${view === "book" || view === "menu" ? "text-brand-orange" : "text-stone-500 hover:text-brand-blue dark:text-stone-400"}`}
                >
                  {t.book || (lang === 'ar' ? "الحجز" : "Booking")}
                  <ChevronDown size={12} className={`transition-transform duration-300 ${isBookingOpen ? 'rotate-180' : ''}`} />
                  {(view === "book" || view === "menu") && (
                    <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-brand-orange rounded-full animate-fade-in"></div>
                  )}
                </button>
                
                {isBookingOpen && (
                  <>
                    {/* Invisible bridge to keep menu open when moving mouse down */}
                    <div className="absolute top-full left-0 w-full h-4 z-40" />
                    
                    <div className="absolute top-[calc(100%-5px)] left-0 w-48 bg-white dark:bg-stone-800 rounded-2xl shadow-xl py-2 border border-stone-100 dark:border-stone-700 z-50 animate-slide-up overflow-hidden">
                      <button
                        onClick={() => { setView("book"); setIsBookingOpen(false); }}
                        className={`w-full text-start px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors flex items-center gap-3 ${view === "book" ? "text-brand-orange bg-stone-50 dark:bg-stone-700" : "text-stone-600 dark:text-stone-300"}`}
                      >
                        <Calendar size={16} />
                        {t.bookNow}
                      </button>
                      <button
                        onClick={() => { setView("menu"); setIsBookingOpen(false); }}
                        className={`w-full text-start px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors flex items-center gap-3 ${view === "menu" ? "text-brand-orange bg-stone-50 dark:bg-stone-700" : "text-stone-600 dark:text-stone-300"}`}
                      >
                        <Utensils size={16} />
                        {t.menu}
                      </button>
                    </div>
                  </>
                )}
              </div>


              <button
                onClick={() => setView("admin")}
                className={`text-[11px] tracking-[0.2em] uppercase font-black transition-all relative ${view === "admin" ? "text-brand-orange" : "text-stone-500 hover:text-brand-blue dark:text-stone-400"}`}
              >
                {t.admin}
                {view === "admin" && (
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-brand-orange rounded-full animate-fade-in"></div>
                )}
              </button>
            </div>
          </div>

          {/* Center: Logo */}
          <div
            className="flex-shrink-0 cursor-pointer transform hover:scale-105 transition-transform px-4"
            onClick={() => setView("home")}
          >
            <MorenoLogo scale={0.4} />
          </div>

          {/* Right: Actions */}
          <div className="flex-1 flex items-center justify-end gap-1 md:gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-stone-600 hover:text-brand-blue dark:text-stone-300 transition-colors"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-stone-600 hover:text-brand-orange dark:text-stone-300 transition-colors"
            >
              <ShoppingBag size={20} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-fade-in shadow-sm">
                  {cart.reduce((sum, item) => sum + item.qty, 0)}
                </span>
              )}
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1.5 text-stone-600 hover:text-brand-blue dark:text-stone-300 font-black text-[10px] md:text-xs px-2 py-2 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-all uppercase tracking-wider"
              >
                <Globe size={16} />{" "}
                <span className="hidden sm:inline-flex items-center gap-1">
                  {translations[lang].flag} {lang.toUpperCase()}
                </span>
              </button>
              {isLangOpen && (
                <div
                  className="absolute top-full mt-2 w-20 bg-white dark:bg-stone-800 rounded-2xl shadow-xl py-2 border border-stone-100 dark:border-stone-700 z-50 animate-slide-down"
                  style={{ [t.dir === "rtl" ? "left" : "right"]: 0 }}
                >
                  {Object.keys(translations).map((l) => (
                    <button
                      key={l}
                      onClick={() => {
                        setLang(l);
                        setIsLangOpen(false);
                      }}
                      className={`w-full text-center px-4 py-3 text-lg hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors flex items-center justify-center ${lang === l ? "bg-stone-100 dark:bg-stone-700" : ""}`}
                      title={translations[l].label}
                    >
                      <span>{translations[l].flag}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isMenuOpen && (
        <div
          className={`md:hidden fixed inset-0 z-[200] flex ${t.dir === "rtl" ? "flex-row" : "flex-row-reverse"}`}
          onClick={() => setIsMenuOpen(false)}
        >
          <div className="flex-1 bg-black/60 backdrop-blur-sm animate-fade-in" />
          <div
            className={`w-72 max-w-[85vw] bg-stone-50 h-fit m-4 rounded-[2.5rem] shadow-2xl flex flex-col relative z-50 overflow-hidden ${t.dir === "rtl" ? "animate-slide-in-right" : "animate-slide-in-left"} border border-stone-200`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 px-6 flex items-center justify-between border-b border-stone-200 bg-white">
              <h3 className="text-lg font-serif font-bold text-brand-blue">
                {t.menu}
              </h3>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-xl bg-stone-100 text-stone-500 hover:bg-brand-orange/10 hover:text-brand-orange transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {[
                {
                  key: "home",
                  icon: <Home size={20} />,
                  color: "text-blue-500",
                },
                {
                  key: "book",
                  icon: <Calendar size={20} />,
                  label: t.bookNow,
                  color: "text-brand-orange",
                },
                {
                  key: "menu",
                  icon: <Utensils size={20} />,
                  color: "text-orange-500",
                },
                {
                  key: "admin",
                  icon: <Lock size={20} />,
                  color: "text-purple-500",
                },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setView(item.key);
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center gap-4 w-full p-4 rounded-2xl transition-all duration-300 group ${
                    view === item.key
                      ? "bg-white shadow-md border-l-4 border-brand-orange"
                      : "bg-white/50 hover:bg-white hover:shadow-sm border-l-4 border-transparent"
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-xl bg-white shadow-sm ${view === item.key ? "text-brand-orange" : item.color}`}
                  >
                    {item.icon}
                  </div>
                  <span
                    className={`font-bold text-base ${view === item.key ? "text-brand-orange" : "text-stone-700"}`}
                  >
                    {item.label || t[item.key]}
                  </span>
                  {view === item.key && (
                    <div className="ml-auto animate-pulse">
                      <div className="w-1.5 h-1.5 bg-brand-orange rounded-full" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
});

Navbar.displayName = "Navbar";

export default Navbar;
