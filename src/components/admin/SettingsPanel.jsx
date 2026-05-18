import React, { useState, useEffect } from "react";
import { Settings, Key, Clock, Users, Utensils, Mail, AlertTriangle, CheckCircle } from "lucide-react";

const SettingsPanel = React.memo(function SettingsPanel({
  settings,
  t,
  onSave,
  isSuperAdmin,
  lang,
}) {
  const [localSettings, setLocalSettings] = useState(settings || {});

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  return (
    <div className="glass-card hover-lift p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-stone-100/50 mb-12 animate-fade-scale">
      <h3 className="text-2xl font-serif text-brand-blue mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings size={28} className="text-brand-orange" />
          {t.settings}
        </div>
        <span className="bg-brand-blue text-white text-[10px] px-3 py-1 rounded-full uppercase tracking-widest">
          {isSuperAdmin ? (lang === 'ar' ? 'أدمن' : 'Super Admin') : t.mainAdminRole}
        </span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {isSuperAdmin && (
          <div className="space-y-4">
            <h4 className="font-bold text-stone-500 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Key size={16} /> {t.securityNote}
            </h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-tighter">
                    {t.mainAdminRole} {t.password}
                  </label>
                  <input
                    type="text"
                    value={localSettings.adminPass || ""}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        adminPass: e.target.value,
                      })
                    }
                    className="w-full bg-stone-50 p-3 rounded-xl border border-stone-100 font-bold text-sm"
                  />
                </div>
              </div>
              <p className="text-[10px] text-stone-400 font-medium italic">
                * {t.securityNoteDesc}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h4 className="font-bold text-stone-500 flex items-center gap-2 text-sm uppercase tracking-wider">
            <Clock size={16} /> {t.manageShifts}
          </h4>
          <div className="grid grid-cols-1 gap-3">
            {[
              { label: t.shift1Label, key: "shift1" },
              { label: t.shift2Label, key: "shift2" },
              { label: t.shiftOriLabel, key: "shiftOri" },
            ].map((shift) => (
              <div
                key={shift.key}
                className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100"
              >
                <span className="text-xs font-bold text-stone-500">
                  {shift.label}
                </span>
                <input
                  type="text"
                  value={localSettings[shift.key] || ""}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      [shift.key]: e.target.value,
                    })
                  }
                  className="bg-white px-4 py-2 rounded-xl border border-stone-200 text-sm font-black text-brand-blue w-40 text-center"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6 md:col-span-2 mt-4 pt-6 border-t border-stone-100">
          <h4 className="font-bold text-stone-500 flex items-center gap-2 text-sm uppercase tracking-wider">
            <Users size={16} /> {t.maxCapacity}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2 bg-stone-50/50 p-4 rounded-2xl border border-stone-100">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                {t.italian} (Total)
              </label>
              <input
                type="number"
                value={localSettings.capacityItalian || 0}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    capacityItalian: Number(e.target.value),
                  })
                }
                className="w-full bg-white p-3 rounded-xl border border-stone-200 font-black text-xl text-brand-blue"
              />
            </div>
            <div className="space-y-2 bg-stone-50/50 p-4 rounded-2xl border border-stone-100">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                {t.italian} (Per Shift)
              </label>
              <input
                type="number"
                value={localSettings.shiftLimitItalian || 0}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    shiftLimitItalian: Number(e.target.value),
                  })
                }
                className="w-full bg-white p-3 rounded-xl border border-stone-200 font-black text-xl text-brand-orange"
              />
            </div>
            <div className="space-y-2 bg-stone-50/50 p-4 rounded-2xl border border-stone-100">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                {t.oriental} (Total)
              </label>
              <input
                type="number"
                value={localSettings.capacityOriental || 0}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    capacityOriental: Number(e.target.value),
                  })
                }
                className="w-full bg-white p-3 rounded-xl border border-stone-200 font-black text-xl text-brand-blue"
              />
            </div>
          </div>

          <h4 className="font-bold text-stone-500 flex items-center gap-2 text-sm uppercase tracking-wider pt-6 border-t border-stone-100">
            <Utensils size={16} /> {lang === "ar" ? "عدد الطاولات في خريطة المطعم" : "Number of Tables in Layout"}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2 bg-stone-50/50 p-4 rounded-2xl border border-stone-100">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                {t.italian} (Tables / طاولات)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={localSettings.tablesCountItalian !== undefined ? localSettings.tablesCountItalian : 12}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    tablesCountItalian: Number(e.target.value),
                  })
                }
                className="w-full bg-white p-3 rounded-xl border border-stone-200 font-black text-xl text-brand-blue"
              />
            </div>
            <div className="space-y-2 bg-stone-50/50 p-4 rounded-2xl border border-stone-100">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                {t.oriental} (Tables / طاولات)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={localSettings.tablesCountOriental !== undefined ? localSettings.tablesCountOriental : 8}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    tablesCountOriental: Number(e.target.value),
                  })
                }
                className="w-full bg-white p-3 rounded-xl border border-stone-200 font-black text-xl text-brand-blue"
              />
            </div>
          </div>
          
          <div className="space-y-4 pt-6 border-t border-stone-100">
            <h4 className="font-bold text-stone-500 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Mail size={16} className="text-brand-blue" />{" "}
              {t.reportEmail}
            </h4>
            <div className="bg-stone-50/50 p-4 rounded-2xl border border-stone-100">
              <input
                type="email"
                placeholder="manager@example.com"
                value={localSettings.reportEmail || ""}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    reportEmail: e.target.value,
                  })
                }
                className="w-full bg-white p-3 rounded-xl border border-stone-200 font-bold text-stone-700 outline-none focus:ring-2 focus:ring-brand-blue transition-all"
              />
            </div>
          </div>

          <h4 className="font-bold text-stone-500 flex items-center gap-2 text-sm uppercase tracking-wider pt-4">
            <AlertTriangle size={16} className="text-red-500" />{" "}
            {t.emergencyClose}
          </h4>
          <div className="flex gap-4">
            <button
              onClick={() =>
                setLocalSettings({
                  ...localSettings,
                  isClosedItalian: !localSettings.isClosedItalian,
                })
              }
              className={`flex-1 p-4 rounded-2xl font-bold text-sm transition-all border ${localSettings.isClosedItalian ? "bg-red-50 border-red-200 text-red-600" : "bg-green-50 border-green-200 text-green-600"}`}
            >
              {t.italian}:{" "}
              {localSettings.isClosedItalian
                ? t.statusCancelled
                : t.statusConfirmed}
            </button>
            <button
              onClick={() =>
                setLocalSettings({
                  ...localSettings,
                  isClosedOriental: !localSettings.isClosedOriental,
                })
              }
              className={`flex-1 p-4 rounded-2xl font-bold text-sm transition-all border ${localSettings.isClosedOriental ? "bg-red-50 border-red-200 text-red-600" : "bg-green-50 border-green-200 text-green-600"}`}
            >
              {t.oriental}:{" "}
              {localSettings.isClosedOriental
                ? t.statusCancelled
                : t.statusConfirmed}
            </button>
          </div>
        </div>
      </div>
      <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-stone-100">
        {isSuperAdmin && (
          <div className="text-start space-y-1">
            <h5 className="font-black text-stone-700 text-sm flex items-center gap-2">
              <span>🔄</span>
              <span>{lang === "ar" ? "بث تحديث فوري لجميع الأجهزة" : "Broadcast Instant Update to All Devices"}</span>
            </h5>
            <p className="text-stone-400 text-xs font-bold max-w-md leading-relaxed">
              {lang === "ar" 
                ? "اضغط لتنبيه وتحديث التطبيق تلقائياً على هواتف وأجهزة جميع العملاء والنزلاء المتصلين الآن فوراً." 
                : "Click to immediately notify and update the app on all currently connected client devices."}
            </p>
          </div>
        )}
        <div className="flex flex-wrap gap-4 w-full md:w-auto justify-end">
          {isSuperAdmin && (
            <button
              onClick={() => {
                const newVer = Date.now().toString();
                const updated = { ...localSettings, appVersion: newVer };
                setLocalSettings(updated);
                onSave(updated);
              }}
              className="bg-gradient-to-r from-amber-500 to-brand-orange text-white px-6 py-3.5 rounded-2xl font-black text-xs hover:-translate-y-0.5 transition-all shadow-lg shadow-brand-orange/20 flex items-center gap-2 cursor-pointer"
            >
              {lang === "ar" ? "تحديث أجهزة العملاء الآن" : "Update Client Devices Now"}
            </button>
          )}
          <button
            onClick={() => onSave(localSettings)}
            className="bg-brand-blue text-white px-10 py-4 rounded-2xl font-bold hover:bg-brand-blueHover transition-all shadow-lg flex items-center gap-2"
          >
            <CheckCircle size={20} />
            {t.saveSettings}
          </button>
        </div>
      </div>
    </div>
  );
});

export default SettingsPanel;
