import { ShoppingBag, X, ArrowRight } from "lucide-react";
import MagneticButton from "./MagneticButton";

const CartSidebar = ({
  isCartOpen,
  setIsCartOpen,
  cart,
  removeFromCart,
  setView,
  setBookingData,
  activeRestaurantMenu,
  lang,
  t,
}) => {
  if (!isCartOpen) return null;

  const isRtl = t.dir === "rtl";

  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* Backdrop with elegant blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      ></div>
      
      {/* Sidebar Panel with super-deep luxury glassmorphism */}
      <div
        className={`relative w-full md:w-[400px] max-w-full super-glass metallic-border h-full shadow-2xl flex flex-col border-${isRtl ? "r" : "l"} border-stone-100/50 dark:border-stone-800/20 ${isRtl ? "ml-auto slide-in-rtl" : "mr-auto animate-slide-in"} transition-transform duration-500`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-stone-100/50 dark:border-stone-850/50 flex justify-between items-center bg-stone-50/40 dark:bg-stone-950/20">
          <h2 className="text-2xl font-serif text-brand-blue dark:text-white font-black flex items-center gap-3">
            <ShoppingBag size={24} className="text-brand-orange" />
            {t.cartTitle}
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="text-stone-400 dark:text-stone-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-full transition-all cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Cart Items Container */}
        <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar bg-stone-50/20 dark:bg-transparent">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 dark:text-stone-500 opacity-60">
              <ShoppingBag size={64} className="mb-4 animate-float" />
              <p className="text-lg font-bold">{t.emptyCart}</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 items-center bg-white/80 dark:bg-stone-900/60 p-4 rounded-2xl border border-stone-100/50 dark:border-stone-800/80 shadow-sm animate-fade-scale group hover:shadow-md dark:hover:border-brand-orange/30 transition-all duration-300"
              >
                <img
                  src={item.img}
                  className="w-20 h-20 object-cover rounded-xl shadow-sm group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  decoding="async"
                  alt={item.name[lang] || item.name["en"]}
                />
                <div className="flex-grow">
                  <h4 className="font-black text-stone-800 dark:text-stone-200 text-base">
                    {item.name[lang] || item.name["en"]}
                  </h4>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-stone-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-full transition-all self-start cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout action */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-stone-100/50 dark:border-stone-850/50 bg-stone-50/60 dark:bg-stone-950/40 relative">
            <MagneticButton
              onClick={() => {
                setIsCartOpen(false);
                setView("book");
                setBookingData((prev) => ({
                  ...prev,
                  restaurant: activeRestaurantMenu,
                }));
              }}
              isLoading={false}
              className="w-full bg-brand-orange text-white py-4.5 rounded-2xl font-black text-lg shadow-lg shadow-brand-orange/25 hover:shadow-xl hover:shadow-brand-orange/35 flex justify-center items-center gap-2"
            >
              {t.checkout}
              <ArrowRight
                size={20}
                className={isRtl ? "rotate-180" : "rotate-0"}
              />
            </MagneticButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
