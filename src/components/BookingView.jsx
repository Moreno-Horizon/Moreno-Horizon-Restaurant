import { memo } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import {
  User,
  Key,
  MapPin,
  ChevronDown,
  Calendar,
  Clock,
  Users,
  Utensils,
  MessageSquare,
} from "lucide-react";

function BookingView({
  t,
  setView,
  bookingData,
  setBookingData,
  handleInputChange,
  getLocalDate,
  settings,
  availableTablesCount,
}) {
  const canGoToMenu =
    bookingData.name &&
    bookingData.phone &&
    bookingData.room &&
    bookingData.restaurant &&
    bookingData.guests &&
    bookingData.time;

  return (
    <div className="max-w-4xl mx-auto py-16 px-4 animate-fade-in">
      <div className="bg-white p-8 md:p-14 rounded-[2rem] md:rounded-[3.5rem] shadow-xl border border-stone-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-blue/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-serif text-brand-blue text-center mb-4">
              {t.bookingTitle}
            </h2>
            <div className="w-20 h-1 bg-brand-orange mx-auto mb-12 rounded-full"></div>

            {/* Info Box for Tables with Progress Bar */}
            <div className="bg-stone-50/50 p-6 md:p-8 rounded-[2rem] mb-10 shadow-sm border border-stone-100 flex flex-col gap-3">
              <div className="flex justify-between items-end mb-1">
                <div>
                  <span className="text-stone-400 font-bold text-[10px] uppercase tracking-widest block mb-1">
                    {bookingData.restaurant === "italian" ? t.italian : t.oriental}
                  </span>
                  <span className="text-brand-blue font-black text-xl md:text-2xl">
                    {t.availableTables}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-brand-orange font-black text-4xl leading-none drop-shadow-sm">
                    {availableTablesCount}
                  </span>
                  <span className="text-stone-400 font-bold text-sm md:text-base">
                    / {(() => {
                      if (bookingData.restaurant === "italian") {
                        return bookingData.time ? (settings.shiftLimitItalian || 40) : (settings.capacityItalian || 80);
                      } else {
                        return settings.capacityOriental || 30;
                      }
                    })()}
                  </span>
                </div>
              </div>
              
              <div className="w-full h-4 md:h-5 bg-stone-200/60 rounded-full overflow-hidden shadow-inner relative liquid-progress">
                <div
                  className={`liquid-progress-fill h-full rounded-full transition-all duration-1000 ease-out ${
                    typeof availableTablesCount === "number" && availableTablesCount < 5
                      ? "bg-gradient-to-r from-red-500 to-red-600 shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                      : typeof availableTablesCount === "number" && availableTablesCount < 15
                      ? "bg-gradient-to-r from-orange-400 to-brand-orange shadow-[0_0_12px_rgba(249,115,22,0.4)]"
                      : "bg-gradient-to-r from-[#34E0A1] to-[#2bb884] shadow-[0_0_12px_rgba(52,224,161,0.4)]"
                  }`}
                  style={{
                    width: `${typeof availableTablesCount === "number"
                      ? Math.max(5, Math.min(100, (availableTablesCount / (() => {
                          if (bookingData.restaurant === "italian") {
                            return bookingData.time ? (settings.shiftLimitItalian || 40) : (settings.capacityItalian || 80);
                          } else {
                            return settings.capacityOriental || 30;
                          }
                        })()) * 100))
                      : 100}%`,
                  }}
                ></div>
              </div>
              
              {availableTablesCount < 5 && availableTablesCount > 0 && (
                <p className="text-[11px] text-red-500 font-bold mt-2 animate-pulse uppercase tracking-widest">
                  {t.dir === "rtl"
                    ? "الأماكن المتبقية محدودة جداً! سارع بالحجز"
                    : "VERY LIMITED SEATS LEFT! BOOK NOW"}
                </p>
              )}
            </div>

            <form
              className="space-y-6 md:space-y-8"
              onSubmit={(e) => {
                e.preventDefault();
                if (canGoToMenu) setView("menu");
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <User
                    className="absolute top-1/2 -translate-y-1/2 text-stone-400"
                    style={{
                      [t.dir === "rtl" ? "right" : "left"]: "1.25rem",
                    }}
                  />
                  <input
                    type="text"
                    name="name"
                    required
                    minLength={3}
                    value={bookingData.name}
                    onChange={handleInputChange}
                    placeholder={t.fullName}
                    className={`w-full bg-stone-50/80 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white transition font-bold border border-transparent focus:border-brand-orange/20 ${t.dir === "rtl" ? "pr-12" : "pl-12"}`}
                  />
                </div>
                <div className="relative" dir="ltr">
                  <style>{`
                                          .PhoneInput {
                                              display: flex;
                                              align-items: center;
                                              width: 100%;
                                              background: rgba(250, 250, 249, 0.8);
                                              padding: 1.25rem;
                                              border-radius: 1rem;
                                              border: 2px solid transparent;
                                              transition: all 0.3s;
                                          }
                                          .PhoneInput:focus-within {
                                              border-color: rgba(249, 115, 22, 0.2);
                                              background: white;
                                          }
                                          .PhoneInputInput {
                                              flex: 1;
                                              min-width: 0;
                                              background: transparent;
                                              border: none;
                                              outline: none;
                                              font-weight: bold;
                                              padding-left: 0.5rem;
                                          }
                                      `}</style>
                  <PhoneInput
                    international
                    defaultCountry="EG"
                    value={bookingData.phone}
                    onChange={(val) =>
                      setBookingData({ ...bookingData, phone: val || "" })
                    }
                    placeholder={t.phone}
                    className="phone-custom-wrapper"
                  />
                </div>
                <div className="relative md:col-span-2">
                  <Key
                    className="absolute top-1/2 -translate-y-1/2 text-stone-400"
                    style={{
                      [t.dir === "rtl" ? "right" : "left"]: "1.25rem",
                    }}
                  />
                  <input
                    type="text"
                    name="room"
                    required
                    pattern="[0-9]{4}"
                    inputMode="numeric"
                    maxLength="4"
                    value={bookingData.room}
                    onChange={handleInputChange}
                    placeholder={t.roomNumber}
                    className={`w-full bg-stone-50/80 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white transition font-bold border border-transparent focus:border-brand-orange/20 ${t.dir === "rtl" ? "pr-12" : "pl-12"}`}
                  />
                </div>
                <div className="relative md:col-span-2">
                  <MapPin
                    className="absolute top-1/2 -translate-y-1/2 text-stone-400"
                    style={{
                      [t.dir === "rtl" ? "right" : "left"]: "1.25rem",
                    }}
                  />
                  <select
                    name="restaurant"
                    required
                    value={bookingData.restaurant}
                    onChange={handleInputChange}
                    className={`w-full bg-stone-50/80 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white transition font-bold border border-transparent focus:border-brand-orange/20 appearance-none ${t.dir === "rtl" ? "pr-12" : "pl-12"}`}
                  >
                    <option value="" disabled>
                      {t.restaurantType}
                    </option>
                    <option value="italian">{t.italian}</option>
                    <option
                      value="oriental"
                      disabled={new Date().getDay() === 4}
                    >
                      {t.oriental}{" "}
                      {new Date().getDay() === 4
                        ? `(${t.only} ${t.italian})`
                        : ""}
                    </option>
                  </select>
                  <ChevronDown
                    className="absolute top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
                    style={{
                      [t.dir === "rtl" ? "left" : "right"]: "1.25rem",
                    }}
                  />
                </div>

                {/* Date Selection (Disabled as it's for today) */}
                <div className="relative">
                  <Calendar
                    className="absolute top-1/2 -translate-y-1/2 text-stone-400"
                    style={{
                      [t.dir === "rtl" ? "right" : "left"]: "1.25rem",
                    }}
                  />
                  <input
                    type="date"
                    name="date"
                    disabled
                    value={getLocalDate()}
                    className={`w-full bg-stone-100 p-5 rounded-2xl outline-none transition font-bold border border-transparent cursor-not-allowed opacity-80 ${t.dir === "rtl" ? "pr-12" : "pl-12"}`}
                  />
                </div>
                <div className="relative">
                  <Clock
                    className="absolute top-1/2 -translate-y-1/2 text-stone-400"
                    style={{
                      [t.dir === "rtl" ? "right" : "left"]: "1.25rem",
                    }}
                  />
                  <select
                    name="time"
                    required
                    value={bookingData.time}
                    onChange={handleInputChange}
                    disabled={!bookingData.restaurant}
                    className={`w-full bg-stone-50/80 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white transition font-bold border border-transparent focus:border-brand-orange/20 appearance-none ${!bookingData.restaurant ? "opacity-50 cursor-not-allowed" : ""} ${t.dir === "rtl" ? "pr-12" : "pl-12"}`}
                  >
                    <option value="" disabled>
                      {bookingData.restaurant
                        ? t.time
                        : t.selectRestaurantFirst}
                    </option>
                    {bookingData.restaurant === "italian" && (
                      <>
                        <option value={settings.shift1 || "18:30 - 19:30"}>
                          {t.shift1Label || "Shift 1"}: {settings.shift1 || "18:30 - 19:30"}
                        </option>
                        <option value={settings.shift2 || "20:00 - 21:00"}>
                          {t.shift2Label || "Shift 2"}: {settings.shift2 || "20:00 - 21:00"}
                        </option>
                      </>
                    )}
                    {bookingData.restaurant === "oriental" && (
                      <option value={settings.shiftOri || "19:00 - 20:00"}>
                        {t.shiftOriLabel || "Shift"}: {settings.shiftOri || "19:00 - 20:00"}
                      </option>
                    )}
                  </select>
                  <ChevronDown
                    className="absolute top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
                    style={{
                      [t.dir === "rtl" ? "left" : "right"]: "1.25rem",
                    }}
                  />
                </div>
                <div className="relative md:col-span-2">
                  <Users
                    className="absolute top-1/2 -translate-y-1/2 text-stone-400"
                    style={{
                      [t.dir === "rtl" ? "right" : "left"]: "1.25rem",
                    }}
                  />
                  <select
                    name="guests"
                    required
                    value={bookingData.guests}
                    onChange={handleInputChange}
                    className={`w-full bg-stone-50/80 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white transition font-bold border border-transparent focus:border-brand-orange/20 appearance-none ${t.dir === "rtl" ? "pr-12" : "pl-12"}`}
                  >
                    <option value="" disabled>
                      {t.guests}
                    </option>
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {t.guests}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
                    style={{
                      [t.dir === "rtl" ? "left" : "right"]: "1.25rem",
                    }}
                  />
                </div>
                <div className="relative md:col-span-2">
                  <MessageSquare
                    className="absolute top-6 -translate-y-1/2 text-stone-400"
                    style={{
                      [t.dir === "rtl" ? "right" : "left"]: "1.25rem",
                    }}
                  />
                  <textarea
                    name="notes"
                    value={bookingData.notes}
                    onChange={handleInputChange}
                    placeholder={t.notesPlaceholder || "Any special requests?"}
                    className={`w-full bg-stone-50/80 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white transition font-bold border border-transparent focus:border-brand-orange/20 min-h-[100px] resize-none ${t.dir === "rtl" ? "pr-12" : "pl-12"}`}
                  />
                </div>
                {/* Continue to Menu Selection Button */}
                <div className="md:col-span-2 pt-6">
                  <button
                    type="button"
                    onClick={() => setView("menu")}
                    disabled={!canGoToMenu}
                    className={`w-full py-6 rounded-[2rem] text-xl md:text-2xl font-black transition-all shadow-xl flex justify-center items-center gap-3 ${canGoToMenu ? "bg-brand-orange text-white hover:bg-brand-orangeHover hover:shadow-2xl" : "bg-stone-200 text-stone-400 cursor-not-allowed"}`}
                  >
                    <Utensils size={28} />
                    {t.continueToMenu}
                  </button>
                  {!canGoToMenu && (
                    <p className="text-center text-stone-400 font-bold text-xs mt-4 uppercase tracking-widest">
                      {t.incompleteBooking}
                    </p>
                  )}
                </div>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
}

const MemoizedBookingView = memo(BookingView);
MemoizedBookingView.displayName = "BookingView";

export default MemoizedBookingView;
