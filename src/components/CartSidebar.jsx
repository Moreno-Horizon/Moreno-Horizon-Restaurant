
import { ShoppingBag, X, ArrowRight } from "lucide-react";

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

  return (
    <div className="fixed inset-0 z-[100] flex">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      ></div>
      <div
        className={`relative w-full md:w-[400px] max-w-full bg-white h-full shadow-2xl flex flex-col ${t.dir === "rtl" ? "ml-auto slide-in-rtl" : "mr-auto animate-slide-in"}`}
      >
        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
          <h2 className="text-2xl font-serif text-brand-blue flex items-center gap-3">
            <ShoppingBag size={24} className="text-brand-orange" />{" "}
            {t.cartTitle}
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="text-stone-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 opacity-60">
              <ShoppingBag size={64} className="mb-4" />
              <p className="text-lg">{t.emptyCart}</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-stone-100 shadow-sm animate-fade-in group hover:shadow-md transition-all"
              >
                <img
                  src={item.img}
                  className="w-20 h-20 object-cover rounded-xl shadow-sm"
                  loading="lazy"
                  decoding="async"
                  alt={item.name[lang] || item.name["en"]}
                />
                <div className="flex-grow">
                  <h4 className="font-bold text-stone-800">
                    {item.name[lang] || item.name["en"]}
                  </h4>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-stone-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors self-start"
                >
                  <X size={20} />
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-stone-100 bg-stone-50">
            <button
              onClick={() => {
                setIsCartOpen(false);
                setView("book");
                setBookingData((prev) => ({
                  ...prev,
                  restaurant: activeRestaurantMenu,
                }));
              }}
              className="w-full bg-brand-blue text-white py-4 rounded-2xl font-bold text-lg hover:bg-brand-blueHover transition-colors shadow-lg flex justify-center items-center gap-2"
            >
              {t.checkout}{" "}
              <ArrowRight
                size={20}
                className={t.dir === "rtl" ? "rotate-180" : ""}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
