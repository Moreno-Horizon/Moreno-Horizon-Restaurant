import React, { useState } from "react";
import { XCircle, Search, Plus, Trash2 } from "lucide-react";

const OrderEditorModal = ({
  booking,
  onClose,
  lang,
  currentUser,
  db,
  updateDoc,
  doc,
  serverTimestamp,
  showToast,
  MENU_ITEMS,
  t,
  addLog
}) => {
  const [localCart, setLocalCart] = useState(
    booking.items || booking.cart || []
  );
  const [deletedItems, setDeletedItems] = useState([]);
  const [localBooking, setLocalBooking] = useState({
    name: booking.name,
    room: booking.room,
    guests: booking.guests,
    date: booking.date,
    time: booking.time,
    restaurant: booking.restaurant,
    resId: booking.resId,
    status: booking.status,
    notes: booking.notes || "",
  });
  const [itemSearch, setItemSearch] = useState("");
  const [showItemAdder, setShowItemAdder] = useState(false);

  const handleRemoveItem = (index) => {
    const item = localCart[index];
    setDeletedItems([...deletedItems, item]);
    setLocalCart(localCart.filter((_, i) => i !== index));
  };

  const handleAddItem = (item) => {
    const currentTotal = localCart.reduce((sum, i) => sum + i.qty, 0);
    const pax = parseInt(localBooking.guests) || 0;

    if (currentTotal >= pax) {
      showToast(t.paxLimitReached || "Pax limit reached");
      return;
    }

    const existing = localCart.find((i) => i.id === item.id);
    if (existing) {
      setLocalCart(
        localCart.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + 1 } : i
        )
      );
    } else {
      setLocalCart([...localCart, { ...item, qty: 1 }]);
    }
    setItemSearch("");
  };

  const handleSave = async () => {
    try {
      const currentTotal = localCart.reduce((sum, i) => sum + i.qty, 0);
      const pax = parseInt(localBooking.guests) || 0;

      // Ensure items don't exceed pax if there are items
      if (localCart.length > 0 && currentTotal > pax) {
        showToast(t.paxLimitReached || "Total items exceed pax count");
        return;
      }

      const orderSummary = localCart
        .map(
          (i) =>
            `${i.qty}x ${typeof i.name === "string" ? i.name : i.name[lang] || i.name["en"]}`
        )
        .join(", ");
      await updateDoc(doc(db, "bookings", booking.id.toString()), {
        ...localBooking,
        items: localCart,
        orderDetails:
          orderSummary ||
          (lang === "ar" ? "لا يوجد طلب طعام" : "No food order"),
        updatedBy: currentUser.name,
        updatedAt: serverTimestamp(),
      });
      await addLog("update_booking", `${lang === "ar" ? "تعديل حجز" : "Updated booking for"} ${localBooking.name} (${lang === "ar" ? "غرفة" : "Room"} ${localBooking.room}). ${lang === "ar" ? "الحالة:" : "Status:"} ${localBooking.status}`);
      showToast(t.success);
      onClose();
    } catch (e) {
      console.error(e);
      showToast(t.error);
    }
  };

  const filteredMenuItems = MENU_ITEMS.filter((item) => {
    const resMatch = localBooking.resId
      ? item.restaurant === localBooking.resId
      : true;
    const searchMatch =
      itemSearch === "" ||
      (typeof item.name === "string"
        ? item.name
        : item.name[lang] || item.name["en"]
      )
        .toLowerCase()
        .includes(itemSearch.toLowerCase());
    return resMatch && searchMatch;
  });

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
        <div className="p-8 bg-stone-50 border-b border-stone-100 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-2xl font-serif text-brand-blue">
              {t.editOrderDetails}
            </h3>
            <p className="text-stone-400 font-bold text-xs uppercase tracking-widest mt-1">
              {t.updateBookingData}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-stone-200 rounded-full transition-all text-stone-400"
          >
            <XCircle size={24} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
          {/* Status Selector */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-orange px-1">
              {t.status}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                "pending",
                "confirmed",
                "waitlist",
                "completed",
                "cancelled",
              ].map((s) => (
                <button
                  key={s}
                  onClick={() =>
                    setLocalBooking({ ...localBooking, status: s })
                  }
                  className={`px-4 py-3 rounded-xl text-xs font-black transition-all border ${
                    localBooking.status === s
                      ? "bg-brand-blue text-white border-brand-blue shadow-md"
                      : "bg-white text-stone-400 border-stone-100 hover:border-stone-200"
                  }`}
                >
                  {s === "pending"
                    ? t.statusPending
                    : s === "confirmed"
                      ? t.statusConfirmed
                      : s === "waitlist"
                        ? t.statusWaitlist
                        : s === "completed"
                          ? t.statusCompleted
                          : t.statusCancelled}
                </button>
              ))}
            </div>
          </div>

          {/* Core Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 px-1">
                {t.name}
              </label>
              <input
                type="text"
                value={localBooking.name}
                onChange={(e) =>
                  setLocalBooking({ ...localBooking, name: e.target.value })
                }
                className="w-full bg-stone-50 border border-stone-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-brand-orange font-bold text-brand-blue"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 px-1">
                {t.room}
              </label>
              <input
                type="text"
                value={localBooking.room}
                onChange={(e) =>
                  setLocalBooking({ ...localBooking, room: e.target.value })
                }
                className="w-full bg-stone-50 border border-stone-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-brand-orange font-bold text-brand-blue"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 px-1">
                {t.guests}
              </label>
              <input
                type="number"
                value={localBooking.guests}
                onChange={(e) =>
                  setLocalBooking({ ...localBooking, guests: e.target.value })
                }
                className="w-full bg-stone-50 border border-stone-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-brand-orange font-bold text-brand-blue"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 px-1">
                {t.time}
              </label>
              <input
                type="text"
                value={localBooking.time}
                onChange={(e) =>
                  setLocalBooking({ ...localBooking, time: e.target.value })
                }
                className="w-full bg-stone-50 border border-stone-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-brand-orange font-bold text-brand-blue"
              />
            </div>
          </div>

          {/* Additional Comments */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 px-1">
              {t.comments}
            </label>
            <textarea
              value={localBooking.notes}
              onChange={(e) =>
                setLocalBooking({ ...localBooking, notes: e.target.value })
              }
              rows={3}
              className="w-full bg-stone-50 border border-stone-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-brand-orange font-bold text-brand-blue resize-none custom-scrollbar text-sm"
              placeholder={t.comments}
            />
          </div>

          {/* Food Items Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-stone-100 pb-2">
              <h4 className="text-sm font-black uppercase tracking-[0.2em] text-brand-orange">
                {t.foodItems}
                <span className="ms-2 text-[10px] text-stone-400">
                  ({localCart.reduce((sum, i) => sum + i.qty, 0)} /{" "}
                  {localBooking.guests} PAX)
                </span>
              </h4>
              <button
                onClick={() => setShowItemAdder(!showItemAdder)}
                className="flex items-center gap-1 text-xs font-black text-brand-blue hover:text-brand-orange transition-all"
              >
                {showItemAdder ? <XCircle size={14} /> : <Plus size={14} />}
                {t.addDish}
              </button>
            </div>

            {showItemAdder && (
              <div className="bg-stone-50 p-4 rounded-3xl border border-stone-100 space-y-4 animate-fade-in">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t.searchDish || "Search dish..."}
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    className="w-full p-3 ps-10 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-brand-blue text-sm font-bold"
                  />
                  <Search
                    size={16}
                    className="absolute top-1/2 -translate-y-1/2 left-3 text-stone-400"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 custom-scrollbar">
                  {filteredMenuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleAddItem(item)}
                      className="flex items-center gap-3 p-2 bg-white rounded-xl border border-stone-100 hover:border-brand-blue transition-all text-start group"
                    >
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                        <img
                          src={item.img}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-brand-blue truncate">
                          {typeof item.name === "string"
                            ? item.name
                            : item.name[lang] || item.name["en"]}
                        </p>
                        <p className="text-[8px] text-stone-400 font-bold uppercase">
                          {item.category}
                        </p>
                      </div>
                      <Plus
                        size={14}
                        className="text-stone-300 group-hover:text-brand-blue"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {localCart.length === 0 ? (
              <div className="text-center py-8 text-stone-400 font-bold bg-stone-50 rounded-3xl border border-dashed border-stone-200">
                {t.noItemsInOrder}
              </div>
            ) : (
              <div className="space-y-3">
                {localCart.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-white rounded-2xl border border-stone-100 hover:border-brand-orange/30 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-brand-orange/10 rounded-xl flex items-center justify-center font-black text-brand-orange text-sm">
                        {item.qty}x
                      </div>
                      <div>
                        <p className="font-bold text-brand-blue text-sm">
                          {typeof item.name === "string"
                            ? item.name
                            : item.name[lang] || item.name["en"]}
                        </p>
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                          {item.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const newCart = [...localCart];
                          if (newCart[idx].qty > 1) {
                            newCart[idx].qty -= 1;
                            setLocalCart(newCart);
                          } else {
                            handleRemoveItem(idx);
                          }
                        }}
                        className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Show Deleted Items for reference (To be replaced) */}
            {deletedItems.length > 0 && (
              <div className="space-y-3 opacity-50 grayscale mt-6">
                <p className="text-[10px] font-black uppercase text-stone-400 px-1">
                  {t.deletedItemsForReplacement}
                </p>
                {deletedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100 line-through"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-stone-400">
                        {item.qty}x
                      </span>
                      <p className="text-xs font-bold text-stone-400">
                        {typeof item.name === "string"
                          ? item.name
                          : item.name[lang] || item.name["en"]}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setLocalCart([...localCart, item]);
                        setDeletedItems(
                          deletedItems.filter((_, i) => i !== idx)
                        );
                      }}
                      className="text-[10px] font-bold text-brand-blue hover:underline"
                    >
                      {t.undo}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-8 bg-stone-50 border-t border-stone-100 flex gap-4 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-8 py-4 rounded-2xl font-black text-stone-400 hover:bg-stone-50 transition-all"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-brand-orange text-white px-8 py-4 rounded-2xl font-black hover:bg-brand-orangeHover transition-all shadow-lg"
          >
            {t.saveSettings || "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderEditorModal;
