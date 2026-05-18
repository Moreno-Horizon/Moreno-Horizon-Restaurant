import React, { useState, useMemo } from "react";
import { collection, doc, setDoc, deleteDoc, addDoc } from "firebase/firestore";
import { UserX, ShieldAlert, Calendar, Search, X, Check, Trash2 } from "lucide-react";

const BlacklistPanel = React.memo(function BlacklistPanel({
  blacklist = [],
  t,
  db,
  showToast,
  currentUser,
  lang,
}) {
  const [newValue, setNewValue] = useState("");
  const [newReason, setNewReason] = useState("");
  const [newExpiry, setNewExpiry] = useState("");
  const [activeTab, setActiveTab] = useState("active"); // "active" or "history"
  const [searchQuery, setSearchQuery] = useState("");

  const processedBlacklist = useMemo(() => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    return blacklist.map((item) => {
      let computedStatus = item.status || "active";
      if (computedStatus === "active" && item.expiryDate && today > item.expiryDate) {
        computedStatus = "expired";
      }
      return {
        ...item,
        computedStatus,
      };
    });
  }, [blacklist]);

  const activeBans = useMemo(() => {
    return processedBlacklist.filter((item) => item.computedStatus === "active");
  }, [processedBlacklist]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const sourceList = activeTab === "active" ? activeBans : processedBlacklist;
    if (!q) return sourceList;

    return sourceList.filter((item) => {
      const val = (item.value || "").toLowerCase();
      const reason = (item.reason || "").toLowerCase();
      const admin = (item.bannedBy || "").toLowerCase();
      return val.includes(q) || reason.includes(q) || admin.includes(q);
    });
  }, [processedBlacklist, activeBans, searchQuery, activeTab]);

  const handleAdd = async () => {
    if (!newValue.trim()) {
      if (showToast) showToast(lang === "ar" ? "⚠️ يرجى إدخال رقم الهاتف أو الغرفة" : "⚠️ Please enter a Room or Phone number");
      return;
    }
    if (!newReason.trim()) {
      if (showToast) showToast(t.reasonPlaceholder || "يرجى كتابة سبب الحظر بالتفصيل");
      return;
    }

    try {
      await addDoc(collection(db, "blacklist"), {
        value: newValue.trim(),
        reason: newReason.trim(),
        expiryDate: newExpiry || "", // empty means permanent
        status: "active",
        bannedBy: currentUser?.name || "Admin",
        createdAt: new Date().toISOString(),
      });

      setNewValue("");
      setNewReason("");
      setNewExpiry("");
      if (showToast) showToast(lang === "ar" ? "🛑 تم إضافة العميل للقائمة السوداء بنجاح!" : "🛑 Client blacklisted successfully!");
    } catch (err) {
      console.error("Error adding to blacklist:", err);
      if (showToast) showToast(lang === "ar" ? "فشل إضافة العميل" : "Failed to add client");
    }
  };

  const handleLiftBan = async (id) => {
    const confirmMsg = lang === "ar" 
      ? "هل أنت متأكد من رفع الحظر عن هذا العميل؟" 
      : "Are you sure you want to lift the ban for this client?";
    if (!window.confirm(confirmMsg)) return;

    try {
      await setDoc(doc(db, "blacklist", id), {
        status: "unbanned",
        unbannedBy: currentUser?.name || "Admin",
        unbannedAt: new Date().toISOString(),
      }, { merge: true });

      if (showToast) showToast(t.successUnban || "تم رفع الحظر بنجاح! 🔓");
    } catch (err) {
      console.error("Error lifting ban:", err);
      if (showToast) showToast(lang === "ar" ? "فشل رفع الحظر" : "Failed to lift ban");
    }
  };

  const handleDeleteLog = async (id) => {
    if (!window.confirm(t.confirmDelete)) return;
    try {
      await deleteDoc(doc(db, "blacklist", id));
      if (showToast) showToast(lang === "ar" ? "🗑️ تم حذف السجل نهائياً!" : "🗑️ Log entry deleted permanently!");
    } catch (err) {
      console.error("Error deleting log:", err);
      if (showToast) showToast(lang === "ar" ? "فشل حذف السجل" : "Failed to delete log");
    }
  };

  return (
    <div
      className="glass-card p-8 rounded-[2.5rem] shadow-xl border border-stone-100/50 animate-fade-scale mt-12 overflow-hidden"
      style={{ animationDelay: "0.2s" }}
    >
      <div className="flex justify-between items-center mb-8 border-b border-stone-100 pb-5">
        <h3 className="text-2xl font-black text-brand-blue flex items-center gap-3">
          <UserX size={28} className="text-red-500 animate-pulse" />
          <span>{t.manageBlacklist}</span>
        </h3>
        
        <span className="bg-red-50 text-red-600 px-3 py-1.5 rounded-xl text-xs font-black border border-red-100 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
          {activeBans.length} {lang === "ar" ? "محظورين حالياً" : "Currently Banned"}
        </span>
      </div>

      <div className="bg-gradient-to-br from-stone-50 to-white p-6 md:p-8 rounded-3xl border border-stone-100 shadow-inner mb-8">
        <h4 className="font-black text-stone-700 text-sm mb-4 uppercase tracking-wider flex items-center gap-2">
          <span>🛑</span>
          <span>{lang === "ar" ? "إضافة عميل جديد لقائمة الحظر" : "Add New Client to Blacklist"}</span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block">
              {t.phone} / {t.roomNumber}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={lang === "ar" ? "مثال: 1102 أو +201..." : "e.g. 1102 or +201..."}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="w-full bg-white px-4 py-3.5 rounded-xl border border-stone-200 text-sm font-black text-stone-800 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block">
              {t.banReason}
            </label>
            <input
              type="text"
              placeholder={t.reasonPlaceholder || "أدخل سبب الحظر بالتفصيل..."}
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              className="w-full bg-white px-4 py-3.5 rounded-xl border border-stone-200 text-sm font-bold text-stone-800 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block flex justify-between">
              <span>{t.banExpiry}</span>
              <span className="text-red-500 font-bold lowercase">({t.permanentBan})</span>
            </label>
            <div className="relative flex gap-2">
              <input
                type="date"
                value={newExpiry}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setNewExpiry(e.target.value)}
                className="flex-1 bg-white px-4 py-3 rounded-xl border border-stone-200 text-sm font-black text-stone-800 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-sm"
              />
              <button
                onClick={handleAdd}
                className="bg-red-500 hover:bg-red-600 text-white px-6 rounded-xl font-black text-xs transition-all shadow-md shadow-red-500/15 flex items-center justify-center gap-1.5"
              >
                <ShieldAlert size={14} />
                <span>{t.addToBlacklist}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center mb-6">
        <div className="bg-stone-100 p-1 rounded-2xl flex gap-1 border border-stone-200/50 self-start">
          <button
            onClick={() => {
              setActiveTab("active");
              setSearchQuery("");
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === "active"
                ? "bg-white text-red-600 shadow-sm"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <ShieldAlert size={14} />
            <span>{t.activeBans}</span>
            <span className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold ${
              activeTab === "active" ? "bg-red-50 text-red-600" : "bg-stone-200 text-stone-600"
            }`}>
              {activeBans.length}
            </span>
          </button>
          
          <button
            onClick={() => {
              setActiveTab("history");
              setSearchQuery("");
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === "history"
                ? "bg-white text-stone-800 shadow-sm"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <Calendar size={14} />
            <span>{t.banHistory}</span>
            <span className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold ${
              activeTab === "history" ? "bg-stone-200 text-stone-700" : "bg-stone-200 text-stone-600"
            }`}>
              {processedBlacklist.length}
            </span>
          </button>
        </div>

        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <Search size={14} className="text-stone-400" />
          </span>
          <input
            type="text"
            placeholder={t.allBlacklistPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-2xl ps-9 pe-4 py-2.5 text-xs font-bold text-stone-800 placeholder-stone-400 outline-none focus:bg-white focus:border-brand-blue transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 end-0 flex items-center pe-3 text-stone-400 hover:text-stone-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12 px-4 bg-stone-50 rounded-3xl border border-dashed border-stone-200">
          <div className="w-12 h-12 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Search size={22} />
          </div>
          <p className="font-bold text-stone-600 text-sm">
            {lang === "ar" ? "لا توجد نتائج مطابقة للبحث." : "No matching records found."}
          </p>
        </div>
      ) : activeTab === "active" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-red-50/30 border border-red-100 hover:border-red-300 rounded-3xl p-5 shadow-sm transition-all relative overflow-hidden group flex flex-col justify-between"
            >
              <div className="absolute top-0 start-0 w-1.5 h-full bg-red-500"></div>

              <div>
                <div className="flex justify-between items-start gap-2 mb-3">
                  <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-xl text-xs font-black border border-red-100 inline-block">
                    🚫 {item.value}
                  </span>

                  <span className="bg-white text-stone-500 px-2.5 py-1 rounded-lg text-[9px] font-black border border-stone-100 tracking-wide inline-block uppercase">
                    {item.expiryDate ? item.expiryDate : (lang === "ar" ? "دائم ♾️" : "Permanent")}
                  </span>
                </div>

                <h4 className="text-stone-800 font-bold text-sm leading-snug mt-1">
                  {item.reason || (lang === "ar" ? "لا يوجد سبب مدون" : "No reason logged")}
                </h4>

                <div className="border-t border-stone-100 my-3.5"></div>

                <div className="space-y-1 text-[10px] text-stone-400 font-bold">
                  <div className="flex justify-between">
                    <span>{t.bannedBy}:</span>
                    <span className="text-stone-600">{item.bannedBy || "Admin"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.banDate}:</span>
                    <span className="text-stone-600">{item.createdAt ? item.createdAt.split("T")[0] : "-"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => handleLiftBan(item.id)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-black text-[10px] flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-emerald-600/10"
                >
                  <Check size={12} />
                  <span>{t.unbanBtn}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-stone-100 shadow-sm bg-white">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100 text-[10px] font-black text-stone-400 uppercase tracking-wider text-start">
                <th className="p-4 text-start">{t.phone} / {t.roomNumber}</th>
                <th className="p-4 text-start">{t.banReason}</th>
                <th className="p-4 text-start">{t.banDate} & {t.bannedBy}</th>
                <th className="p-4 text-start">{t.banExpiry}</th>
                <th className="p-4 text-start">{t.status}</th>
                <th className="p-4 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs font-bold text-stone-700">
              {filteredItems.map((item) => {
                let badgeClass = "bg-red-50 text-red-600 border border-red-100";
                let statusLabel = t.banStatusActive;
                if (item.computedStatus === "unbanned") {
                  badgeClass = "bg-green-50 text-green-600 border border-green-100";
                  statusLabel = t.banStatusUnbanned;
                } else if (item.computedStatus === "expired") {
                  badgeClass = "bg-amber-50 text-amber-600 border border-amber-100 animate-pulse";
                  statusLabel = t.banStatusExpired;
                }

                return (
                  <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="p-4 whitespace-nowrap">
                      <span className="font-black text-stone-900 bg-stone-100 px-2 py-1 rounded-lg">
                        {item.value}
                      </span>
                    </td>

                    <td className="p-4 max-w-xs truncate">
                      <span className="text-stone-800" title={item.reason}>
                        {item.reason || "-"}
                      </span>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-stone-800">{item.createdAt ? item.createdAt.split("T")[0] : "-"}</span>
                        <span className="text-[10px] text-stone-400 font-bold">{t.addedBy}: {item.bannedBy || "Admin"}</span>
                      </div>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <span className="text-stone-600">
                        {item.expiryDate ? item.expiryDate : (lang === "ar" ? "دائم ♾️" : "Permanent")}
                      </span>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black inline-block self-start ${badgeClass}`}>
                          {statusLabel}
                        </span>
                        {item.computedStatus === "unbanned" && (
                          <span className="text-[9px] text-stone-400 block max-w-[130px] truncate" title={`${t.unbannedBy}: ${item.unbannedBy || "Admin"}`}>
                            {item.unbannedAt ? item.unbannedAt.split("T")[0] : ""} • {item.unbannedBy || "Admin"}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 whitespace-nowrap text-center">
                      <div className="flex justify-center items-center gap-1.5">
                        {item.computedStatus === "active" && (
                          <button
                            onClick={() => handleLiftBan(item.id)}
                            title={t.unbanBtn}
                            className="bg-green-50 hover:bg-green-100 text-green-600 p-2 rounded-xl border border-green-200 transition-all"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteLog(item.id)}
                          title={t.delete}
                          className="bg-red-50 hover:bg-red-100 text-red-500 p-2 rounded-xl border border-red-200 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

export default BlacklistPanel;
