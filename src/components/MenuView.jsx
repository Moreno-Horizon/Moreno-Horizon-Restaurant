import React, { memo } from "react";
import { Plus, Check, ArrowLeft } from "lucide-react";
import { CATEGORIES, MENU_ITEMS } from "../data";

const MenuView = memo(({
  t,
  lang,
  activeRestaurantMenu,
  setActiveRestaurantMenu,
  addToCart,
  bookingData,
  cart,
  submitBooking,
  availableTablesCount,
  setView,
}) => {
  const isRestaurantLocked = !!bookingData.restaurant;
  const isBookingFlow = !!bookingData.name;
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const paxCount = Number(bookingData.guests || 0);

  return (
    <div className={`animate-fade-in ${isBookingFlow ? "pb-40" : "pb-20"}`}>
      {isBookingFlow && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-white/90 backdrop-blur-xl border-t border-stone-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] animate-slide-up">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="hidden md:block">
              <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">
                {t.reservationInfo}
              </p>
              <p className="text-brand-blue font-black">
                {totalItems} / {paxCount} {t.items}
              </p>
            </div>
            <div className="flex-grow flex gap-3">
              <button
                onClick={() => setView("book")}
                className="px-6 py-4 rounded-2xl font-bold text-stone-500 hover:bg-stone-50 transition-all border border-stone-200 flex items-center gap-2"
              >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline">{t.back}</span>
              </button>
              <button
                onClick={submitBooking}
                disabled={totalItems === 0 || availableTablesCount <= 0}
                className={`flex-grow py-4 rounded-2xl font-black text-white shadow-xl transition-all flex items-center justify-center gap-2 ${totalItems === 0 || availableTablesCount <= 0 ? "bg-stone-400 cursor-not-allowed" : "bg-brand-orange hover:bg-brand-orangeHover hover:-translate-y-1"}`}
              >
                <Check size={20} />
                {t.confirmBooking}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="text-center py-12 px-4 bg-stone-100/50">
        <h2 className="text-4xl md:text-6xl font-serif text-brand-blue mb-4">
          {t.menu}
        </h2>
        {isRestaurantLocked && (
          <p className="text-brand-orange font-black text-xl md:text-2xl uppercase tracking-widest mb-2">
            {bookingData.restaurant === "italian" ? t.italian : t.oriental}
          </p>
        )}
        <p className="text-stone-500 max-w-lg mx-auto font-bold uppercase tracking-widest text-xs">
          {t.menuSubtitle}
        </p>
      </div>

      {/* Restaurant Toggle - Only show if NOT locked */}
      {!isRestaurantLocked && (
        <div className="flex justify-center gap-3 py-8 px-4 sticky top-[60px] md:top-20 z-40 bg-white/80 backdrop-blur-md border-b border-stone-100">
          <button
            onClick={() => setActiveRestaurantMenu("oriental")}
            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${activeRestaurantMenu === "oriental" ? "bg-brand-orange text-white shadow-lg" : "bg-white text-stone-600 border border-stone-200"}`}
          >
            {t.oriental}
          </button>
          <button
            onClick={() => setActiveRestaurantMenu("italian")}
            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${activeRestaurantMenu === "italian" ? "bg-brand-blue text-white shadow-lg" : "bg-white text-stone-600 border border-stone-200"}`}
          >
            {t.italian}
          </button>
        </div>
      )}

      {/* Sticky Category Pills - Hide for Oriental as it only has one category */}
      {activeRestaurantMenu !== "oriental" && (
        <div className="sticky top-[136px] md:top-[144px] z-30 bg-stone-50/95 backdrop-blur-md border-b border-stone-200 py-3">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 md:justify-center">
              {Object.entries(CATEGORIES)
                .filter(([key]) => key !== "all")
                .map(([catKey, catLabel]) => {
                  const hasItems = MENU_ITEMS.some(
                    (item) =>
                      item.restaurant === activeRestaurantMenu &&
                      item.category === catKey,
                  );
                  if (!hasItems) return null;
                  return (
                    <button
                      key={catKey}
                      onClick={() =>
                        document
                          .getElementById(`cat-${catKey}`)
                          ?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          })
                      }
                      className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border border-stone-300 bg-white text-stone-600 hover:bg-brand-orange hover:text-white hover:border-brand-orange transition-all"
                    >
                      {catLabel[lang] || catLabel["en"]}
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Category Sections */}
      <div className="px-4 mt-6 space-y-8 max-w-2xl mx-auto">
        {Object.entries(CATEGORIES)
          .filter(([key]) => key !== "all")
          .map(([catKey, catLabel]) => {
            const categoryItems = MENU_ITEMS.filter(
              (item) =>
                item.restaurant === activeRestaurantMenu &&
                item.category === catKey,
            );
            if (categoryItems.length === 0) return null;

            return (
              <div
                key={catKey}
                id={`cat-${catKey}`}
                className="scroll-mt-40"
              >
                {/* Category Header - Hide for Oriental */}
                {activeRestaurantMenu !== "oriental" && (
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-6 bg-brand-orange rounded-full"></div>
                    <h3 className="text-base font-black text-stone-800 uppercase tracking-widest">
                      {catLabel[lang] || catLabel["en"]}
                    </h3>
                  </div>
                )}

                {/* Items — horizontal cards */}
                <div className="flex flex-col gap-3">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 flex flex-row items-stretch"
                    >
                      <img
                        src={item.img}
                        className="w-24 h-24 object-cover flex-shrink-0"
                        alt={item.name[lang] || item.name["en"]}
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="flex flex-col flex-grow p-3 justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-brand-blue leading-tight">
                            {item.name[lang] || item.name["en"]}
                          </h4>
                          {item.desc && (
                            <p className="text-stone-400 text-[11px] mt-1 leading-snug line-clamp-2">
                              {item.desc[lang] || item.desc["en"]}
                            </p>
                          )}
                        </div>
                        {(() => {
                          const isInCart = cart.some(i => i.id === item.id);
                          return (
                            <button
                              onClick={() => addToCart(item)}
                              className={`mt-2 self-start px-4 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                                isInCart 
                                  ? "bg-[#34E0A1] text-white border-transparent" 
                                  : "bg-brand-orange/10 text-brand-orange border border-brand-orange/30 hover:bg-brand-orange hover:text-white"
                              }`}
                            >
                              {isInCart ? <Check size={12} strokeWidth={3} /> : <Plus size={12} strokeWidth={3} />}
                              {isInCart 
                                ? (lang === 'ar' ? 'تم الاختيار' : 'Selected') 
                                : t.addToCart}
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
});

export default MenuView;
