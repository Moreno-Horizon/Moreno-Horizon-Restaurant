import React from "react";
import { Utensils, ArrowLeftRight, XCircle, UserPlus, CheckCircle, Unlock, Printer, Phone, Sparkles } from "lucide-react";

const TableMapPanel = ({
  lang,
  selectedMapRes,
  ITALIAN_TABLES,
  ORIENTAL_TABLES,
  bookingsByTable,
  setSelectedMapRes,
  setSelectedMapTable,
  setMovingBooking,
  settings,
  selectedMapTime,
  setSelectedMapTime,
  t,
  movingBooking,
  selectedMapTable,
  waitlistBookings,
  unassignedBookings,
  assignTableToBooking,
  completeBookingFromMap,
  unassignTable,
  printReceipt,
  setWalkInGuests,
  setShowWalkInModal,
  adminStartDate,
  todayStr
}) => {
  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-stone-100 relative overflow-hidden animate-fade-in mb-8 no-print">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-brand-blue"></div>

      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-black text-brand-blue flex items-center gap-2">
            <Utensils className="text-emerald-500 animate-pulse" size={26} />
            <span>{lang === "ar" ? "خريطة الطاولات التفاعلية" : "Interactive Table Map"}</span>
            <span className="ms-2 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black shadow-sm flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              {lang === "ar" ? "مزامنة فورية ⚡" : "Live Synced ⚡"}
            </span>
          </h3>
          <p className="text-stone-400 text-xs mt-1.5 font-bold">
            {lang === "ar"
              ? `عرض وإدارة توزيع الضيوف للغداء/العشاء ليوم: ${adminStartDate || todayStr}`
              : `Visualize and manage guest seating layout for: ${adminStartDate || todayStr}`}
          </p>
        </div>

        {/* Quick Stats Summary */}
        <div className="flex gap-4 text-xs font-bold bg-stone-50 p-3 rounded-2xl border border-stone-100">
          <div className="text-center">
            <p className="text-stone-400 uppercase tracking-wider text-[9px] mb-0.5">{lang === "ar" ? "إجمالي الطاولات" : "Total Tables"}</p>
            <p className="text-stone-700 text-sm">
              {selectedMapRes === "italian" ? ITALIAN_TABLES.length : ORIENTAL_TABLES.length}
            </p>
          </div>
          <div className="w-px bg-stone-200"></div>
          <div className="text-center">
            <p className="text-stone-400 uppercase tracking-wider text-[9px] mb-0.5">{lang === "ar" ? "المحجوزة" : "Booked"}</p>
            <p className="text-rose-600 text-sm">
              {Object.keys(bookingsByTable).length}
            </p>
          </div>
          <div className="w-px bg-stone-200"></div>
          <div className="text-center">
            <p className="text-stone-400 uppercase tracking-wider text-[9px] mb-0.5">{lang === "ar" ? "الشاغرة" : "Available"}</p>
            <p className="text-emerald-600 text-sm">
              {(selectedMapRes === "italian" ? ITALIAN_TABLES.length : ORIENTAL_TABLES.length) - Object.keys(bookingsByTable).length}
            </p>
          </div>
        </div>
      </div>

      {/* Map Filtering Controls */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-stone-50 p-4 rounded-3xl border border-stone-100 mb-8">
        <div className="flex flex-wrap gap-3">
          {/* Restaurant Buttons */}
          <button
            onClick={() => {
              setSelectedMapRes("italian");
              setSelectedMapTable(null);
              setMovingBooking(null);
            }}
            className={`px-5 py-2.5 rounded-2xl text-sm font-black transition-all shadow-sm ${
              selectedMapRes === "italian"
                ? "bg-brand-blue text-white scale-[1.02]"
                : "bg-white text-stone-500 hover:bg-stone-100"
            }`}
          >
            {lang === "ar" ? "🇮🇹 مطعم إيطالي (La Mama)" : "🇮🇹 Italian (La Mama)"}
          </button>
          <button
            onClick={() => {
              setSelectedMapRes("oriental");
              setSelectedMapTable(null);
              setMovingBooking(null);
            }}
            className={`px-5 py-2.5 rounded-2xl text-sm font-black transition-all shadow-sm ${
              selectedMapRes === "oriental"
                ? "bg-brand-orange text-white scale-[1.02]"
                : "bg-white text-stone-500 hover:bg-stone-100"
            }`}
          >
            {lang === "ar" ? "🇪🇬 مطعم شرقي (Aseel)" : "🇪🇬 Oriental (Aseel)"}
          </button>
        </div>

        {/* Shift selector (only for Italian) */}
        {selectedMapRes === "italian" && (
          <div className="flex gap-2 bg-white p-1.5 rounded-2xl shadow-inner border border-stone-200">
            <button
              onClick={() => {
                setSelectedMapTime(settings?.shift1 || "18:30 - 19:30");
                setSelectedMapTable(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedMapTime === (settings?.shift1 || "18:30 - 19:30")
                  ? "bg-stone-900 text-white shadow-sm"
                  : "text-stone-500 hover:bg-stone-50"
              }`}
            >
              {lang === "ar"
                ? `${t.shift1Label || "الفترة الأولى"} (${(settings?.shift1 || "18:30 - 19:30").split(" - ")[0]})`
                : `${t.shift1Label || "First Shift"} (${(settings?.shift1 || "18:30 - 19:30").split(" - ")[0]})`}
            </button>
            <button
              onClick={() => {
                setSelectedMapTime(settings?.shift2 || "20:00 - 21:00");
                setSelectedMapTable(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedMapTime === (settings?.shift2 || "20:00 - 21:00")
                  ? "bg-stone-900 text-white shadow-sm"
                  : "text-stone-500 hover:bg-stone-50"
              }`}
            >
              {lang === "ar"
                ? `${t.shift2Label || "الفترة الثانية"} (${(settings?.shift2 || "20:00 - 21:00").split(" - ")[0]})`
                : `${t.shift2Label || "Second Shift"} (${(settings?.shift2 || "20:00 - 21:00").split(" - ")[0]})`}
            </button>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-bold text-stone-500 self-center">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 border border-emerald-400 inline-block"></span>
            <span>{lang === "ar" ? "شاغرة" : "Empty"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-500/20 border border-rose-400 inline-block"></span>
            <span>{lang === "ar" ? "محجوزة" : "Booked"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-blue-500/20 border border-blue-400 inline-block"></span>
            <span>{lang === "ar" ? "محددة" : "Selected"}</span>
          </div>
        </div>
      </div>

      {/* Move Banner Indicator */}
      {movingBooking && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-3xl mb-6 shadow-md flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <ArrowLeftRight size={22} className="text-white" />
            <span className="font-bold text-sm">
              {lang === "ar"
                ? `قيد النقل: الحجز الخاص بـ ${movingBooking.name} (غرفة ${movingBooking.room}) 🔄 انقر فوق أي طاولة فارغة لنقله إليها.`
                : `Moving: Booking for ${movingBooking.name} (Room ${movingBooking.room}) 🔄 Click any empty table to seat them.`}
            </span>
          </div>
          <button
            onClick={() => setMovingBooking(null)}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-xl font-bold text-xs transition-all"
          >
            {lang === "ar" ? "إلغاء النقل" : "Cancel"}
          </button>
        </div>
      )}

      {/* Main Map + Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Visual Floor Plan BluePrint */}
        <div className="lg:col-span-3 relative">
          <div className="relative w-full aspect-[16/9] min-h-[350px] md:min-h-[480px] bg-stone-900 border border-stone-800 rounded-[2.5rem] p-6 overflow-hidden shadow-2xl">
            
            {/* Subtle Floor Grid lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#2d2d30_1px,transparent_1px),linear-gradient(to_bottom,#2d2d30_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30"></div>
            
            {/* Dining Zone Division */}

            {/* Zone Dividers (Subtle dashed borders) */}
            <div className="absolute top-0 bottom-0 left-[55%] border-l border-dashed border-stone-700/50 pointer-events-none"></div>
            <div className="absolute top-0 bottom-0 left-[75%] border-l border-dashed border-stone-700/50 pointer-events-none"></div>

            {/* Draw Tables */}
            {(selectedMapRes === "italian" ? ITALIAN_TABLES : ORIENTAL_TABLES).map((t) => {
              const assignedBooking = bookingsByTable[t.name];
              const isOccupied = !!assignedBooking;
              const isSelected = selectedMapTable && selectedMapTable.id === t.id;
              const isMoveTarget = movingBooking && !isOccupied;

              // Node color styles
              let statusClass = "border-emerald-500/30 bg-stone-900/60 text-emerald-400 neon-glow-green hover:border-emerald-400/60 hover:bg-emerald-500/10 z-10";
              let pulseDot = "bg-emerald-500";

              if (isOccupied) {
                statusClass = "border-rose-500/30 bg-stone-900/60 text-rose-400 neon-glow-rose hover:border-rose-400/60 hover:bg-rose-500/10 z-10";
                pulseDot = "bg-rose-500";
              }
              if (isSelected) {
                statusClass = "border-blue-500/60 bg-stone-850/80 text-blue-300 neon-glow-blue z-20 selected-table";
                pulseDot = "bg-blue-500";
              }
              if (isMoveTarget) {
                statusClass = "border-blue-400/50 bg-blue-500/5 text-blue-400 hover:bg-blue-500/15 cursor-pointer animate-pulse z-20";
                pulseDot = "bg-blue-400";
              }

              // Rounded / Rectangle layouts
              const shapeClass = t.type === "round"
                ? "rounded-full w-16 h-16 md:w-20 md:h-20"
                : t.type === "square"
                  ? "rounded-3xl w-16 h-16 md:w-20 md:h-20"
                  : "rounded-3xl w-24 h-16 md:w-28 md:h-20";

              return (
                <button
                  key={t.id}
                  onClick={() => {
                    if (isMoveTarget) {
                      // Complete transfer
                       assignTableToBooking(movingBooking, t.name);
                      setMovingBooking(null);
                    } else {
                      setSelectedMapTable(t);
                    }
                  }}
                  className={`absolute flex flex-col items-center justify-center border-2 shadow-lg backdrop-blur-md floor-table-btn ${shapeClass} ${statusClass}`}
                  style={{
                    left: `${t.x}%`,
                    top: `${t.y}%`,
                  }}
                >
                  {/* Pulsing indicator top-right */}
                  <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseDot}`}></span>
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${pulseDot}`}></span>
                  </span>

                  {/* Table Label */}
                  <span className="text-xs font-black uppercase tracking-wider block opacity-70 mb-0.5">
                    {lang === "ar" ? `طاولة ${t.name}` : `Table ${t.name}`}
                  </span>

                  {/* Seating PAX Capacity */}
                  <span className="text-[10px] font-black opacity-50 block mb-1">
                    👥 {t.seats}
                  </span>

                  {/* Assigned Guest Short Info */}
                  {isOccupied && (
                    <div className="px-1.5 py-0.5 bg-black/30 rounded-md max-w-[90%] overflow-hidden text-[9px] font-black tracking-wide text-rose-300 truncate text-center">
                      {assignedBooking.room ? `G-${assignedBooking.room}` : ""}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Side Control Panel */}
        <div className="lg:col-span-1">
          {!selectedMapTable ? (
            // Unselected / Stats State
            <div className="bg-stone-50 border border-stone-200 p-6 rounded-[2rem] flex flex-col justify-between h-full min-h-[300px]">
              <div>
                <h4 className="text-stone-700 font-black text-lg mb-3">
                  {lang === "ar" ? "إدارة الصالة" : "Floor Manager"}
                </h4>
                <p className="text-stone-400 text-xs font-bold leading-relaxed">
                  {lang === "ar"
                    ? "حدد أي طاولة من الخريطة للبدء بتسكين الضيوف، أو تعديل الحجوزات، أو تسجيل حجز مباشر (Walk-In)."
                    : "Select any table from the blueprint to seat guests, shift bookings, or log direct walk-ins."}
                </p>
              </div>

              {/* Occupancy Progress */}
              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-stone-500 mb-1.5">
                    <span>{lang === "ar" ? "نسبة إشغال الطاولات" : "Table Occupancy"}</span>
                    <span>
                      {Math.round(
                        ((Object.keys(bookingsByTable).length) / 
                        (selectedMapRes === "italian" ? ITALIAN_TABLES.length : ORIENTAL_TABLES.length)) * 100
                      )}%
                    </span>
                  </div>
                  <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{
                        width: `${((Object.keys(bookingsByTable).length) / (selectedMapRes === "italian" ? ITALIAN_TABLES.length : ORIENTAL_TABLES.length)) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="border-t border-stone-200 pt-6 mt-6">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-3">
                  {lang === "ar" ? "قائمة الانتظار النشطة" : "Active Waitlist"}
                </span>
                <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-stone-100 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <span className="text-stone-700 font-bold text-xs">
                      {lang === "ar" ? "ضيوف في الانتظار" : "Waitlisted Guests"}
                    </span>
                  </div>
                  <span className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-xl text-[10px] font-black shadow-sm">
                    {waitlistBookings.length}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            // Table Selected State
            <div className="bg-stone-50 border border-stone-200 p-6 rounded-[2rem] flex flex-col justify-between h-full min-h-[380px] animate-fade-in relative">
              <button
                onClick={() => setSelectedMapTable(null)}
                className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-full transition-all"
              >
                <XCircle size={18} />
              </button>

              {/* Table Header Details */}
              <div>
                <span className="bg-stone-200 text-stone-600 px-3 py-1 rounded-full text-[9px] font-black tracking-wider uppercase inline-block mb-3">
                  {selectedMapTable.zone === "indoor"
                    ? (lang === "ar" ? "الصالة الداخلية" : "Indoor")
                    : selectedMapTable.zone === "vip"
                      ? (lang === "ar" ? "ركن VIP الفاخر" : "VIP Suite")
                      : (lang === "ar" ? "التراس الخارجي" : "Outdoor")}
                </span>
                <h4 className="text-stone-800 font-black text-xl leading-tight">
                  {lang === "ar" ? `طاولة رقم ${selectedMapTable.name}` : `Table Number ${selectedMapTable.name}`}
                </h4>
                <p className="text-stone-400 text-xs font-bold mt-1">
                  👥 {lang === "ar" ? `${selectedMapTable.seats} مقاعد كحد أقصى` : `Max Seats: ${selectedMapTable.seats}`}
                </p>

                <div className="border-b border-stone-200 my-5"></div>

                {/* Check if Table is Occupied */}
                {bookingsByTable[selectedMapTable.name] ? (
                  // Occupied state content
                  (() => {
                    const guest = bookingsByTable[selectedMapTable.name];
                    return (
                      <div className="space-y-4 animate-fade-in">
                        <div>
                          <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider block mb-1">
                            {lang === "ar" ? "النزيل المسجل" : "Registered Guest"}
                          </span>
                          <p className="text-stone-800 font-black text-base">{guest.name}</p>
                          <div className="flex gap-2 mt-1.5">
                            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-emerald-100">
                              🏢 {lang === "ar" ? `غرفة ${guest.room}` : `Room ${guest.room}`}
                            </span>
                            <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-rose-100">
                              👥 {guest.guests} {lang === "ar" ? "أفراد" : "PAX"}
                            </span>
                          </div>
                        </div>

                        {guest.phone && (
                          <div>
                            <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider block mb-1">
                              {lang === "ar" ? "رقم الاتصال" : "Contact Number"}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-stone-600 text-xs font-bold" dir="ltr">{guest.phone}</span>
                              <a
                                href={`tel:${guest.phone}`}
                                className="p-1 bg-white hover:bg-stone-200 rounded-lg text-stone-600 transition-all border border-stone-100 shadow-sm"
                              >
                                <Phone size={12} />
                              </a>
                            </div>
                          </div>
                        )}

                        {guest.notes && (
                          <div>
                            <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider block mb-1">
                              {lang === "ar" ? "الملاحظات" : "Notes"}
                            </span>
                            <p className="text-stone-500 text-xs font-bold bg-white p-2 rounded-xl border border-stone-100">
                              {guest.notes}
                            </p>
                          </div>
                        )}

                        <div className="border-b border-stone-200 my-5"></div>

                        {/* Actions Group */}
                        <div className="space-y-2">
                          <button
                            onClick={() => completeBookingFromMap(guest.id)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                          >
                            <CheckCircle size={14} />
                            {lang === "ar" ? "إنهاء الحجز والتحرير 🧹" : "Complete & Free Table 🧹"}
                          </button>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setMovingBooking(guest)}
                              className="bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                            >
                              <ArrowLeftRight size={12} className="text-blue-500" />
                              {lang === "ar" ? "نقل طاولة" : "Move Table"}
                            </button>
                            <button
                              onClick={() => unassignTable(guest)}
                              className="bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                            >
                              <Unlock size={12} className="text-stone-500" />
                              {lang === "ar" ? "إلغاء تعيين" : "Unseat"}
                            </button>
                          </div>

                          <button
                            onClick={() => printReceipt(guest)}
                            className="w-full bg-brand-blue/10 hover:bg-brand-blue/15 text-brand-blue py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all"
                          >
                            <Printer size={12} />
                            {lang === "ar" ? "طباعة الفاتورة 🧾" : "Print Receipt 🧾"}
                          </button>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  // Empty state content (Assign flow)
                  <div className="space-y-4 animate-fade-in">
                    {unassignedBookings.length > 0 ? (
                      <div>
                        <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider block mb-2">
                          {lang === "ar" ? "تسكين ضيف مؤكد" : "Seat Confirmed Booking"}
                        </span>
                        <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                          {unassignedBookings.map((b) => (
                            <button
                              key={b.id}
                              onClick={() => assignTableToBooking(b, selectedMapTable.name)}
                              className="w-full bg-white hover:bg-emerald-50/50 border border-stone-200 hover:border-emerald-300 p-3 rounded-2xl flex flex-col text-start transition-all shadow-sm group"
                            >
                              <span className="font-bold text-stone-800 text-xs group-hover:text-emerald-700">{b.name}</span>
                              <div className="flex justify-between items-center w-full mt-1">
                                <span className="text-[10px] text-stone-400 font-bold">
                                  🏢 {lang === "ar" ? `غرفة ${b.room}` : `Room ${b.room}`} | 👥 {b.guests} {lang === "ar" ? "أفراد" : "PAX"}
                                </span>
                                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all">
                                  {lang === "ar" ? "تسكين 🪑" : "Seat 🪑"}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white p-4 rounded-2xl border border-stone-100 text-center">
                        <p className="text-stone-400 text-xs font-bold leading-normal">
                          {lang === "ar"
                            ? "لا يوجد حجوزات معلقة للتسكين في هذه الفترة."
                            : "No confirmed bookings to seat in this shift."}
                        </p>
                      </div>
                    )}

                    <div className="border-b border-stone-200 my-5"></div>

                    {/* Direct Booking Shortcut */}
                    <div>
                      <button
                        onClick={() => {
                          setWalkInGuests(selectedMapTable.seats.toString());
                          setShowWalkInModal(true);
                        }}
                        className="w-full bg-brand-orange text-white py-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-brand-orangeHover transition-all shadow-md shadow-brand-orange/15"
                      >
                        <UserPlus size={14} />
                        {lang === "ar" ? "إضافة حجز مباشر (Walk-In) ➕" : "Create Walk-In Booking ➕"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default React.memo(TableMapPanel);
