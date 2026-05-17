import React, { useState, useEffect, useMemo } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const secondaryApp = initializeApp(firebaseConfig, "Secondary");
const secondaryAuth = getAuth(secondaryApp);

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart,
  Bar,
} from "recharts";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  X,
  Clock,
  Users,
  Check,
  Plus,
  Mail,
  CheckCircle,
  Trash2,
  Settings,
  Search,
  Key,
  Edit,
  Printer,
  BarChart,
  PieChart,
  AlertTriangle,
  UserX,
  Calendar,
  ShieldAlert,
  Utensils,
} from "lucide-react";

export const MorenoLogo = ({ scale = 1, className = "" }) => (
  <div
    className={`flex flex-col items-center text-center select-none ${className}`}
    style={{ transform: `scale(${scale})`, transformOrigin: "center" }}
  >
    <img
      src="/logo.webp"
      alt="Moreno SPA & RESORT"
      className="w-32 md:w-40 h-auto object-contain drop-shadow-sm"
      loading="lazy"
    />
  </div>
);

export const SettingsPanel = React.memo(function SettingsPanel({
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
        <div className="space-y-4">
          <h4 className="font-bold text-stone-500 flex items-center gap-2 text-sm uppercase tracking-wider">
            <Key size={16} /> {t.securityNote}
          </h4>
          <div className="space-y-4">
            {isSuperAdmin ? (
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
            ) : (
              <div className="bg-stone-50 p-4 rounded-xl border border-dashed border-stone-200">
                <p className="text-xs text-stone-400 font-bold italic">
                  * Restricted Section
                </p>
              </div>
            )}
            <p className="text-[10px] text-stone-400 font-medium italic">
              * {t.securityNoteDesc}
            </p>
          </div>
        </div>

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

          {/* SMS OTP Verification (Deferred)
          <div className="space-y-4 pt-6 border-t border-stone-100">
            <h4 className="font-bold text-stone-500 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Smartphone size={16} className="text-brand-orange" />{" "}
              {t.smsVerificationTitle || "SMS OTP Verification"}
            </h4>
            <div className="bg-stone-50/50 p-6 rounded-2xl border border-stone-100 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-stone-100 shadow-sm">
                <div className="space-y-1">
                  <span className="text-sm font-bold text-stone-700 block">
                    {t.enableSMSVerification}
                  </span>
                  <span className="text-[10px] text-stone-400 block max-w-sm leading-relaxed">
                    {t.smsVerificationDesc}
                  </span>
                </div>
                <button
                  onClick={() =>
                    setLocalSettings({
                      ...localSettings,
                      enableSMSVerification: !localSettings.enableSMSVerification,
                    })
                  }
                  className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all border ${
                    localSettings.enableSMSVerification
                      ? "bg-brand-orange text-white border-brand-orange shadow-md shadow-brand-orange/20"
                      : "bg-stone-50 text-stone-400 border-stone-200"
                  }`}
                >
                  {localSettings.enableSMSVerification
                    ? (lang === "ar" ? "نشط" : "Active")
                    : (lang === "ar" ? "معطل" : "Disabled")}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-stone-100 shadow-sm">
                <div className="space-y-1">
                  <span className="text-sm font-bold text-stone-700 block">
                    {t.sandboxSMS}
                  </span>
                  <span className="text-[10px] text-stone-400 block max-w-sm leading-relaxed">
                    {t.sandboxSMSDesc}
                  </span>
                </div>
                <button
                  onClick={() =>
                    setLocalSettings({
                      ...localSettings,
                      sandboxSMS: !localSettings.sandboxSMS,
                    })
                  }
                  className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all border ${
                    localSettings.sandboxSMS
                      ? "bg-brand-blue text-white border-brand-blue shadow-md shadow-brand-blue/20"
                      : "bg-stone-50 text-stone-400 border-stone-200"
                  }`}
                >
                  {localSettings.sandboxSMS
                    ? (lang === "ar" ? "الوضع التجريبي" : "Demo Mode")
                    : (lang === "ar" ? "وضع التشغيل الفعلي" : "Live Mode")}
                </button>
              </div>
            </div>
          </div>
          */}

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
        <div className="flex flex-wrap gap-4 w-full md:w-auto justify-end">
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

export const UsersPanel = React.memo(function UsersPanel({
  users,
  t,
  db,
  showToast,
}) {
  const [newUserName, setNewUserName] = useState("");
  const [newUserUsername, setNewUserUsername] = useState("");
  const [newUserPass, setNewUserPass] = useState("");
  const [newUserRole, setNewUserRole] = useState("staff");

  const handleAddUser = async () => {
    if (!newUserName || !newUserUsername || !newUserPass) return;
    try {
      const email = newUserUsername + "@moreno.local";
      
      // 1. Create user in Firebase Auth using secondary instance
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, newUserPass);
      const user = userCredential.user;
      
      // 2. Save user profile in Firestore with UID as document ID
      await setDoc(doc(db, "users", user.uid), {
        name: newUserName,
        username: newUserUsername,
        email: email,
        role: newUserRole,
        createdAt: serverTimestamp(),
      });
      
      setNewUserName("");
      setNewUserUsername("");
      setNewUserPass("");
      showToast(t.userAddedSuccess);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async (id) => {
    const confirmMsg = t.confirmDelete;
    if (!window.confirm(confirmMsg)) return;
    try {
      await deleteDoc(doc(db, "users", id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="glass-card hover-lift p-8 rounded-[2.5rem] shadow-xl border border-stone-100/50 animate-fade-in mt-12 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h3 className="text-xl font-bold text-brand-blue flex items-center gap-3">
            <Users size={24} className="text-stone-500" />
            {t.manageUsers}
          </h3>
          <p className="text-stone-400 text-xs mt-1 font-bold">
            {t.userMgmtHelp}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8 bg-stone-50 p-6 rounded-2xl border border-stone-100">
        <input
          type="text"
          placeholder={t.fullName}
          value={newUserName}
          onChange={(e) => setNewUserName(e.target.value)}
          className="bg-white p-3 rounded-xl border border-stone-200 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-blue"
        />
        <input
          type="text"
          placeholder={t.username}
          value={newUserUsername}
          onChange={(e) => setNewUserUsername(e.target.value)}
          className="bg-white p-3 rounded-xl border border-stone-200 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-blue"
        />
        <input
          type="password"
          placeholder={t.password}
          value={newUserPass}
          onChange={(e) => setNewUserPass(e.target.value)}
          className="bg-white p-3 rounded-xl border border-stone-200 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-blue"
        />
        <select
          value={newUserRole}
          onChange={(e) => setNewUserRole(e.target.value)}
          className="bg-white p-3 rounded-xl border border-stone-200 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-blue"
        >
          <option value="staff">{t.staffRole}</option>
          <option value="main">{t.mainAdminRole}</option>
        </select>
        <button
          onClick={handleAddUser}
          className="bg-brand-blue text-white p-3 rounded-xl font-bold hover:bg-brand-blueHover transition-all flex items-center justify-center gap-2 shadow-md"
        >
          <Plus size={18} /> {t.addUser}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-start border-collapse">
          <thead className="bg-stone-50 text-stone-500">
            <tr>
              <th className="p-4 text-xs font-black uppercase tracking-widest text-start">
                {t.fullName}
              </th>
              <th className="p-4 text-xs font-black uppercase tracking-widest text-start">
                {t.username}
              </th>
              <th className="p-4 text-xs font-black uppercase tracking-widest text-start">
                {t.password}
              </th>
              <th className="p-4 text-xs font-black uppercase tracking-widest text-center">
                {t.role}
              </th>
              <th className="p-4 text-xs font-black uppercase tracking-widest text-center">
                {t.actions}
              </th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="p-8 text-center text-stone-400 font-bold"
                >
                  {t.noUsers}
                </td>
              </tr>
            )}
            {users.map((user) => (
              <UserRow key={user.id} user={user} t={t} db={db} onDelete={handleDeleteUser} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

const UserRow = ({ user, t, db, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...user });

  const handleUpdate = async () => {
    try {
      await setDoc(doc(db, "users", user.id), {
        ...editData,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    }
  };

  if (isEditing) {
    return (
      <tr className="border-b border-stone-100 bg-blue-50/30">
        <td className="p-4">
          <input
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            className="w-full bg-white p-2 rounded-lg border border-stone-200 text-sm font-bold"
          />
        </td>
        <td className="p-4">
          <input
            value={editData.username}
            onChange={(e) => setEditData({ ...editData, username: e.target.value })}
            className="w-full bg-white p-2 rounded-lg border border-stone-200 text-sm font-bold"
          />
        </td>
        <td className="p-4">
          <input
            type="text"
            value={editData.password}
            onChange={(e) => setEditData({ ...editData, password: e.target.value })}
            className="w-full bg-white p-2 rounded-lg border border-stone-200 text-sm font-bold"
          />
        </td>
        <td className="p-4">
          <select
            value={editData.role}
            onChange={(e) => setEditData({ ...editData, role: e.target.value })}
            className="w-full bg-white p-2 rounded-lg border border-stone-200 text-sm font-bold"
          >
            <option value="staff">{t.staffRole}</option>
            <option value="main">{t.mainAdminRole}</option>
          </select>
        </td>
        <td className="p-4 text-center">
          <div className="flex justify-center gap-2">
            <button
              onClick={handleUpdate}
              className="text-green-600 hover:bg-green-100 p-2 rounded-lg transition-all"
            >
              <Check size={18} />
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-stone-400 hover:bg-stone-100 p-2 rounded-lg transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-stone-50 hover:bg-stone-50/50 transition-all">
      <td className="p-4 font-black text-brand-blue">{user.name}</td>
      <td className="p-4 text-stone-500 font-bold">{user.username}</td>
      <td className="p-4 text-stone-400 font-mono text-xs">••••••••</td>
      <td className="p-4 text-center">
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.role === "main" ? "bg-brand-blue text-white" : "bg-stone-100 text-stone-500"}`}
        >
          {user.role === "main" ? t.mainAdminRole : t.staffRole}
        </span>
      </td>
      <td className="p-4 text-center">
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-all"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => onDelete(user.id)}
            className="text-red-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export const BlacklistPanel = React.memo(function BlacklistPanel({
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
        
        {/* Statistics Badge */}
        <span className="bg-red-50 text-red-600 px-3 py-1.5 rounded-xl text-xs font-black border border-red-100 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
          {activeBans.length} {lang === "ar" ? "محظورين حالياً" : "Currently Banned"}
        </span>
      </div>

      {/* Adding Form Section */}
      <div className="bg-gradient-to-br from-stone-50 to-white p-6 md:p-8 rounded-3xl border border-stone-100 shadow-inner mb-8">
        <h4 className="font-black text-stone-700 text-sm mb-4 uppercase tracking-wider flex items-center gap-2">
          <span>🛑</span>
          <span>{lang === "ar" ? "إضافة عميل جديد لقائمة الحظر" : "Add New Client to Blacklist"}</span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Room or Phone Number Input */}
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

          {/* Reason Input */}
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

          {/* Expiry Date input */}
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

      {/* Tabs and Searching Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center mb-6">
        {/* Toggle tabs */}
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

        {/* Searching field */}
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

      {/* Records Listing Grid or Audit Table */}
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
        /* Active Bans layout cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-red-50/30 border border-red-100 hover:border-red-300 rounded-3xl p-5 shadow-sm transition-all relative overflow-hidden group flex flex-col justify-between"
            >
              {/* Left boundary glow line */}
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
        /* History & Logs Audit Table */
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
                    {/* Value */}
                    <td className="p-4 whitespace-nowrap">
                      <span className="font-black text-stone-900 bg-stone-100 px-2 py-1 rounded-lg">
                        {item.value}
                      </span>
                    </td>

                    {/* Reason */}
                    <td className="p-4 max-w-xs truncate">
                      <span className="text-stone-800" title={item.reason}>
                        {item.reason || "-"}
                      </span>
                    </td>

                    {/* Creation Date & Action Admin */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-stone-800">{item.createdAt ? item.createdAt.split("T")[0] : "-"}</span>
                        <span className="text-[10px] text-stone-400 font-bold">{t.addedBy}: {item.bannedBy || "Admin"}</span>
                      </div>
                    </td>

                    {/* Expiry */}
                    <td className="p-4 whitespace-nowrap">
                      <span className="text-stone-600">
                        {item.expiryDate ? item.expiryDate : (lang === "ar" ? "دائم ♾️" : "Permanent")}
                      </span>
                    </td>

                    {/* Status Badge & Logs */}
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

                    {/* Action buttons */}
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

export const BestSellersChart = React.memo(function BestSellersChart({
  bookings,
  t,
  lang,
}) {
  const dishCounts = {};
  bookings
    .filter((b) => b.status === "completed" || b.status === "confirmed")
    .forEach((b) => {
      if (b.items) {
        b.items.forEach((item) => {
          const name = item.name[lang] || item.name["en"];
          dishCounts[name] = (dishCounts[name] || 0) + Number(item.qty || 1);
        });
      }
    });
  const sorted = Object.entries(dishCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const max = sorted.length > 0 ? sorted[0][1] : 1;

  return (
    <div
      className="glass-card p-8 rounded-[2.5rem] shadow-xl border border-stone-100/50 animate-fade-scale mt-12 mb-12"
      style={{ animationDelay: "0.3s" }}
    >
      <h3 className="text-xl font-bold text-brand-blue mb-8 flex items-center gap-3">
        <PieChart size={24} className="text-orange-500" />
        {t.bestSellers}
      </h3>
      <div className="space-y-6">
        {sorted.map(([name, count]) => (
          <div key={name} className="space-y-2">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-stone-600">{name}</span>
              <span className="text-brand-blue">
                {count} {t.orders}
              </span>
            </div>
            <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-orange to-orange-400 transition-all duration-1000"
                style={{ width: `${(count / max) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
        {sorted.length === 0 && (
          <p className="text-center text-stone-400 font-bold py-8">
            {t.noSalesYet}
          </p>
        )}
      </div>
    </div>
  );
});

export const AnalyticsDashboard = React.memo(function AnalyticsDashboard({
  bookings,
  t,
  lang,
}) {
  // 1. Italian vs Oriental Ratio
  const restaurantRatio = useMemo(() => {
    let italianCount = 0;
    let orientalCount = 0;
    bookings
      .filter((b) => b.status === "completed" || b.status === "confirmed")
      .forEach((b) => {
        const isItalian =
          b.resId === "italian" ||
          (b.restaurant && b.restaurant.toLowerCase().includes("italian"));
        if (isItalian) {
          italianCount += Number(b.guests || 1);
        } else {
          orientalCount += Number(b.guests || 1);
        }
      });

    return [
      { name: t.italian || "Italian", value: italianCount, color: "#F97316" }, // Brand Orange
      { name: t.oriental || "Oriental", value: orientalCount, color: "#1E293B" }, // Brand Blue / Slate
    ];
  }, [bookings, t]);

  // Total active bookings count in ratio
  const totalRatioPax = useMemo(() => {
    return restaurantRatio.reduce((sum, item) => sum + item.value, 0);
  }, [restaurantRatio]);

  // 2. Daily Busiest Trend (Last 7 Days)
  const weeklyTrendData = useMemo(() => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
      dates.push(local.toISOString().split("T")[0]);
    }

    return dates.map((dateStr) => {
      let pax = 0;
      bookings
        .filter((b) => b.date === dateStr && b.status !== "cancelled")
        .forEach((b) => {
          pax += Number(b.guests || 1);
        });
      const parts = dateStr.split("-");
      const displayDate = `${parts[2]}/${parts[1]}`;
      return {
        date: displayDate,
        [t.totalPax || "Guests"]: pax,
      };
    });
  }, [bookings, t]);

  // 3. Best Sellers Data
  const bestSellersData = useMemo(() => {
    const dishCounts = {};
    bookings
      .filter((b) => b.status === "completed" || b.status === "confirmed")
      .forEach((b) => {
        if (b.items) {
          b.items.forEach((item) => {
            const name = item.name[lang] || item.name["en"] || item.name;
            dishCounts[name] = (dishCounts[name] || 0) + Number(item.qty || 1);
          });
        }
      });
    return Object.entries(dishCounts)
      .map(([name, count]) => ({ name, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [bookings, lang]);

  const hasData = bookings.length > 0;

  return (
    <div className="glass-card p-6 md:p-10 rounded-[2.5rem] shadow-xl border border-stone-100 mt-12 mb-12 animate-fade-in no-print">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-black text-brand-blue flex items-center gap-3">
            <BarChart size={28} className="text-brand-orange animate-pulse" />
            {t.stats || "Statistiche & Grafici"}
          </h3>
          <p className="text-stone-400 font-bold text-xs mt-1 uppercase tracking-wider">
            {t.brand || "Moreno Horizon"} • {t.today || "Oggi"}
          </p>
        </div>
      </div>

      {!hasData ? (
        <p className="text-center text-stone-400 font-bold py-12">
          {t.noSalesYet || "Nessuna vendita completata ancora"}
        </p>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Chart 1: Daily/Weekly Busy Trend */}
          <div className="bg-stone-50/50 p-6 rounded-[2rem] border border-stone-100 flex flex-col h-[350px]">
            <h4 className="text-sm font-bold text-stone-600 mb-4 uppercase tracking-widest">
              {t.weeklyTrend || "Andamento Prenotazioni Settimanale"}
            </h4>
            <div className="flex-1 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={weeklyTrendData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorPax" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} fontWeight="bold" />
                  <YAxis stroke="#94A3B8" fontSize={10} fontWeight="bold" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFF",
                      borderRadius: "1rem",
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      fontWeight: "bold",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={t.totalPax || "Guests"}
                    stroke="#F97316"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorPax)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Italian vs Oriental Ratio */}
          <div className="bg-stone-50/50 p-6 rounded-[2rem] border border-stone-100 flex flex-col h-[350px] relative">
            <h4 className="text-sm font-bold text-stone-600 mb-2 uppercase tracking-widest">
              {lang === "ar" ? "نسبة الحجوزات بين الإيطالي والشرقي" : "Italian vs Oriental Bookings Ratio"}
            </h4>
            <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-6 text-xs">
              <div className="w-[180px] h-[180px] relative shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={restaurantRatio}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {restaurantRatio.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFF",
                        borderRadius: "1rem",
                        border: "1px solid #E2E8F0",
                        fontWeight: "bold",
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
                {/* Total counter in the middle */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-stone-400 font-bold text-[10px] uppercase tracking-wider">
                    {t.guests || "Pax"}
                  </span>
                  <span className="text-2xl font-black text-brand-blue">
                    {totalRatioPax}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-3 justify-center w-full md:w-auto">
                {restaurantRatio.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <span
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    ></span>
                    <div className="flex flex-col">
                      <span className="font-bold text-stone-700 text-sm">{item.name}</span>
                      <span className="text-stone-400 font-bold text-xs">
                        {item.value} {t.paxCount || "pers."} ({totalRatioPax > 0 ? Math.round((item.value / totalRatioPax) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart 3: Best Sellers Dish Chart */}
          <div className="bg-stone-50/50 p-6 rounded-[2rem] border border-stone-100 flex flex-col h-[350px] xl:col-span-2">
            <h4 className="text-sm font-bold text-stone-600 mb-4 uppercase tracking-widest">
              {t.bestSellers || "I più venduti"}
            </h4>
            <div className="flex-1 w-full text-xs">
              {bestSellersData.length === 0 ? (
                <p className="text-center text-stone-400 font-bold py-12 my-auto">
                  {t.noSalesYet || "Nessuna vendita completata ancora"}
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={bestSellersData}
                    layout="vertical"
                    margin={{ top: 10, right: 20, left: 30, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                    <XAxis type="number" stroke="#94A3B8" fontSize={10} fontWeight="bold" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#1E293B"
                      fontSize={10}
                      fontWeight="black"
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFF",
                        borderRadius: "1rem",
                        border: "1px solid #E2E8F0",
                        fontWeight: "bold",
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#F97316"
                      radius={[0, 8, 8, 0]}
                      barSize={18}
                    >
                      {bestSellersData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === 0 ? "#F97316" : index === 1 ? "#fb923c" : "#fdba74"}
                        />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export const CustomerDatabasePanel = React.memo(function CustomerDatabasePanel({
  bookings,
  t,
}) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const customers = React.useMemo(() => {
    const map = new Map();
    bookings.forEach((b) => {
      const key = b.phone || b.name;
      if (!map.has(key)) {
        map.set(key, {
          name: b.name,
          phone: b.phone,
          room: b.room,
          bookingCount: 1,
          lastBooking: b.date,
        });
      } else {
        const existing = map.get(key);
        existing.bookingCount += 1;
        if (new Date(b.date) >= new Date(existing.lastBooking)) {
          existing.lastBooking = b.date;
          existing.room = b.room;
          existing.name = b.name;
        }
      }
    });
    return Array.from(map.values());
  }, [bookings]);

  const filtered = React.useMemo(() => {
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        c.phone.includes(debouncedSearch) ||
        (c.room && c.room.includes(debouncedSearch)),
    );
  }, [customers, debouncedSearch]);

  const visibleItems = React.useMemo(() => {
    return filtered.slice(0, pageSize);
  }, [filtered, pageSize]);

  const exportCSV = () => {
    const headers = ["Name", "Phone", "Last Room", "Total Bookings", "Last Booking"];
    const rows = filtered.map(c => [
      `"${c.name}"`,
      `"${c.phone}"`,
      `"${c.room}"`,
      c.bookingCount,
      `"${c.lastBooking}"`
    ]);
    
    const csvContent = "\uFEFF" + headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `customers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printCustomerDatabase = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const content = `
      <html>
        <head>
          <title>Customer Database - Moreno Horizon</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
            body { font-family: 'Cairo', sans-serif; padding: 40px; direction: ltr; color: #1c1917; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #e7e5e4; padding-bottom: 20px; }
            h1 { margin: 0; font-size: 24px; color: #1c1917; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
            th, td { border: 1px solid #e7e5e4; padding: 10px 8px; text-align: left; }
            th { background-color: #f5f5f4; font-weight: bold; }
            .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #a8a29e; border-top: 1px solid #e7e5e4; padding-top: 20px; }
            @page { size: auto; margin: 0mm; }
            body { margin: 15mm; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Customer Database</h1>
            <p style="color: #78716c; margin-top: 5px;">Total Customers: ${filtered.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone Number</th>
                <th>Last Room</th>
                <th style="text-align: center;">Total Bookings</th>
                <th>Last Booking Date</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length === 0 ? `<tr><td colspan="5" style="text-align: center; font-style: italic; color: #888; padding: 15px;">No customers found</td></tr>` : 
                filtered.map(c => `
                  <tr>
                    <td style="font-weight: bold; color: #2563eb;">${c.name}</td>
                    <td>${c.phone}</td>
                    <td style="font-weight: bold;">${c.room || "-"}</td>
                    <td style="text-align: center; font-weight: bold;">${c.bookingCount}</td>
                    <td>${c.lastBooking}</td>
                  </tr>
                `).join('')
              }
            </tbody>
          </table>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Moreno Horizon SPA & RESORT</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-stone-100 mt-12 animate-fade-in print-section">
      <div className="p-8 border-b border-stone-100 bg-stone-50/50 flex flex-col xl:flex-row justify-between items-center gap-6 no-print">
        <div className="flex flex-col md:flex-row items-center gap-6 w-full xl:w-auto">
          <h3 className="text-2xl font-bold text-brand-blue flex items-center gap-3 whitespace-nowrap">
            <Users size={24} className="text-blue-500" />
            <span className="no-print">{t.customerDb}</span>
            <span className="hidden print:inline">Customer Database</span>
          </h3>
          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={exportCSV}
              className="flex-1 md:flex-none bg-green-50 text-green-600 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-green-600 hover:text-white transition-all border border-green-100 shadow-sm"
            >
              <PieChart size={16} />
              Excel (CSV)
            </button>
            <button 
              onClick={printCustomerDatabase}
              className="flex-1 md:flex-none bg-brand-blue/5 text-brand-blue px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-brand-blue hover:text-white transition-all border border-brand-blue/10 shadow-sm"
            >
              <Printer size={16} />
              PDF / Print
            </button>
          </div>
        </div>
        <div className="relative w-full xl:w-96">
          <input
            type="text"
            placeholder={t.searchNamePhone}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full bg-white p-4 rounded-2xl outline-none border border-stone-200 text-sm font-bold shadow-sm focus:ring-2 focus:ring-brand-blue transition-all ${t.dir === "rtl" ? "pr-12" : "pl-12"}`}
          />
          <Search
            size={20}
            className="absolute top-1/2 -translate-y-1/2 text-stone-400"
            style={{ [t.dir === "rtl" ? "right" : "left"]: "1.2rem" }}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-stone-50 text-stone-500 border-b border-stone-100 text-xs uppercase tracking-wider">
            <tr>
              <th className={`p-6 font-bold ${t.dir === "rtl" ? "text-right" : "text-left"}`}>
                <span className="no-print">{t.fullName}</span>
                <span className="hidden print:inline">Full Name</span>
              </th>
              <th className={`p-6 font-bold ${t.dir === "rtl" ? "text-right" : "text-left"}`}>
                <span className="no-print">{t.phone}</span>
                <span className="hidden print:inline">Phone</span>
              </th>
              <th className={`p-6 font-bold ${t.dir === "rtl" ? "text-right" : "text-left"}`}>
                <span className="no-print">{t.roomNumber}</span>
                <span className="hidden print:inline">Room Number</span>
              </th>
              <th className="p-6 font-bold text-center">
                <span className="no-print">{t.totalBookings}</span>
                <span className="hidden print:inline">Total Bookings</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-12 text-center text-stone-400 font-bold">
                   {t.noBookings}
                </td>
              </tr>
            ) : (
              visibleItems.map((c, i) => (
                <tr
                  key={i}
                  className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors"
                >
                  <td className="p-6">
                    <p className="font-black text-brand-blue text-lg">{c.name}</p>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tight">
                      <span className="no-print">{t.lastBooking}: {c.lastBooking}</span>
                      <span className="hidden print:inline">Last Booking: {c.lastBooking}</span>
                    </p>
                  </td>
                  <td className="p-6 font-bold text-stone-600" dir="ltr">
                    {c.phone}
                  </td>
                  <td className="p-6">
                    <span className="bg-stone-100 text-stone-700 px-3 py-1 rounded-lg font-black border border-stone-200">
                      {c.room}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full font-black text-xl border border-blue-100">
                        {c.bookingCount}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {filtered.length > pageSize && (
        <div className="p-8 border-t border-stone-100 bg-stone-50/30 text-center no-print">
          <button
            onClick={() => setPageSize(prev => prev + 10)}
            className="bg-white text-brand-blue px-8 py-3 rounded-xl font-bold border border-stone-200 hover:bg-stone-50 transition-all shadow-sm"
          >
            {t.loadMore}
          </button>
        </div>
      )}
    </div>
  );
});

// --- LIVE FEEDBACK PANEL (AUTOMATED FEEDBACK SYSTEM) ---
import { onSnapshot, query, orderBy } from "firebase/firestore";
import { Award, TrendingUp, ThumbsUp, Heart, Star as StarIcon, MessageSquare as MessageSquareIcon, Smile } from "lucide-react";

export const FeedbackPanel = React.memo(function FeedbackPanel({ db, t, lang, showToast }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [restaurantFilter, setRestaurantFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");

  useEffect(() => {
    const q = query(collection(db, "feedbacks"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // fallback if timestamp hasn't synced from server yet
          timestamp: doc.data().timestamp ? doc.data().timestamp.toDate() : new Date(),
        }));
        setFeedbacks(list);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading feedbacks:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [db]);

  const handleDelete = async (id) => {
    const msg = lang === "ar" ? "هل أنت متأكد من حذف هذا التقييم؟" : "Are you sure you want to delete this rating?";
    if (!window.confirm(msg)) return;
    try {
      await deleteDoc(doc(db, "feedbacks", id));
      if (showToast) {
        showToast(lang === "ar" ? "تم حذف التقييم بنجاح" : "Rating deleted successfully");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Compute stats
  const stats = useMemo(() => {
    if (feedbacks.length === 0) {
      return { avg: 0, food: 0, service: 0, ambiance: 0, counts: [0, 0, 0, 0, 0], total: 0 };
    }
    let sum = 0, foodSum = 0, serviceSum = 0, ambianceSum = 0;
    const counts = [0, 0, 0, 0, 0]; // 5 to 1

    feedbacks.forEach((f) => {
      sum += f.rating || 0;
      foodSum += f.foodRating || 0;
      serviceSum += f.serviceRating || 0;
      ambianceSum += f.ambianceRating || 0;

      const r = Math.round(f.rating || 5);
      if (r >= 1 && r <= 5) {
        counts[5 - r] += 1;
      }
    });

    const len = feedbacks.length;
    return {
      avg: (sum / len).toFixed(1),
      food: (foodSum / len).toFixed(1),
      service: (serviceSum / len).toFixed(1),
      ambiance: (ambianceSum / len).toFixed(1),
      counts,
      total: len,
    };
  }, [feedbacks]);

  // Filter feedbacks
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((f) => {
      const matchesSearch =
        f.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        f.comment?.toLowerCase().includes(search.toLowerCase()) ||
        f.room?.toString().includes(search);

      const matchesRestaurant =
        restaurantFilter === "all" ||
        (restaurantFilter === "italian" && (f.restaurant?.includes("إيطالي") || f.resId === "italian")) ||
        (restaurantFilter === "oriental" && (f.restaurant?.includes("شرقي") || f.resId === "oriental"));

      let matchesRating = true;
      if (ratingFilter !== "all") {
        const ratingNum = parseInt(ratingFilter, 10);
        if (ratingNum === 5) matchesRating = f.rating >= 4.5;
        else if (ratingNum === 4) matchesRating = f.rating >= 3.5 && f.rating < 4.5;
        else if (ratingNum === 3) matchesRating = f.rating >= 2.5 && f.rating < 3.5;
        else if (ratingNum === 2) matchesRating = f.rating < 2.5;
      }

      return matchesSearch && matchesRestaurant && matchesRating;
    });
  }, [feedbacks, search, restaurantFilter, ratingFilter]);

  const renderStarsList = (val) => {
    const rounded = Math.round(val || 5);
    return (
      <div className="flex gap-0.5 justify-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            size={13}
            className={star <= rounded ? "fill-amber-400 text-amber-400" : "text-stone-200"}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-stone-100 mt-12 overflow-hidden animate-fade-in no-print">
      {/* Header */}
      <div className="p-8 border-b border-stone-100 bg-stone-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-brand-blue flex items-center gap-2.5">
            <Award size={24} className="text-amber-500 animate-pulse" />
            {lang === "ar" ? "نظام تقييمات وآراء العملاء" : "Customer Feedback & Reviews"}
          </h3>
          <p className="text-xs text-stone-400 font-bold mt-1">
            {lang === "ar" ? "متابعة جودة الأطباق ومستوى الخدمة لحظياً" : "Monitor food quality and service levels in real-time"}
          </p>
        </div>
        <span className="bg-amber-50 text-amber-600 px-4 py-1.5 rounded-xl text-xs font-black border border-amber-100 flex items-center gap-1.5 shadow-sm">
          <Smile size={14} />
          {lang === "ar" ? `إجمالي التقييمات: ${stats.total}` : `Total Ratings: ${stats.total}`}
        </span>
      </div>

      {loading ? (
        <div className="p-12 text-center text-stone-400 font-bold">{lang === "ar" ? "جاري تحميل التقييمات..." : "Loading ratings..."}</div>
      ) : feedbacks.length === 0 ? (
        <div className="p-16 text-center text-stone-400 font-bold">
          {lang === "ar" ? "لا توجد تقييمات مرسلة حتى الآن." : "No customer feedback submitted yet."}
        </div>
      ) : (
        <div className="p-8 space-y-8">
          {/* Top Stats Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-stone-50/50 p-6 rounded-3xl border border-stone-100">
            {/* Overall Gauge */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-stone-100 flex flex-col items-center justify-center text-center shadow-sm">
              <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider mb-2">
                {lang === "ar" ? "التقييم العام الكلي" : "Overall Average Rating"}
              </span>
              <div className="relative flex items-center justify-center mb-2">
                <p className="text-5xl font-black text-amber-500 drop-shadow-sm">{stats.avg}</p>
                <span className="text-stone-400 font-black text-xl align-super ml-0.5">/5</span>
              </div>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const filled = star <= Math.round(stats.avg);
                  return (
                    <StarIcon
                      key={star}
                      size={18}
                      className={filled ? "fill-amber-400 text-amber-400" : "text-stone-200"}
                    />
                  );
                })}
              </div>
              <p className="text-xs font-bold text-stone-400">
                {lang === "ar" ? "بناءً على تجارب النزلاء الحقيقية" : "Based on verified guest experiences"}
              </p>
            </div>

            {/* Distribution chart */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-stone-100 flex flex-col justify-center shadow-sm">
              <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider mb-4 text-center lg:text-start">
                {lang === "ar" ? "توزيع نسب النجوم" : "Rating Distribution"}
              </span>
              <div className="space-y-2">
                {stats.counts.map((count, index) => {
                  const stars = 5 - index;
                  const pct = stats.total > 0 ? ((count / stats.total) * 100).toFixed(0) : 0;
                  return (
                    <div key={stars} className="flex items-center gap-3">
                      <span className="text-xs font-black text-stone-500 w-6 flex items-center gap-0.5">
                        {stars}★
                      </span>
                      <div className="flex-grow bg-stone-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            stars >= 4 ? "bg-amber-400" : stars === 3 ? "bg-yellow-400" : "bg-red-400"
                          }`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-stone-400 w-8 text-end">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sub-categories */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-stone-100 flex flex-col justify-between shadow-sm space-y-4">
              {/* Food Quality Sub-stat */}
              <div className="flex items-center justify-between border-b border-stone-50 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-stone-600">{lang === "ar" ? "جودة الطعام" : "Food Quality"}</p>
                    {renderStarsList(stats.food)}
                  </div>
                </div>
                <span className="text-lg font-black text-stone-700">{stats.food}</span>
              </div>

              {/* Service Sub-stat */}
              <div className="flex items-center justify-between border-b border-stone-50 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                    <ThumbsUp size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-stone-600">{lang === "ar" ? "مستوى الخدمة" : "Service Quality"}</p>
                    {renderStarsList(stats.service)}
                  </div>
                </div>
                <span className="text-lg font-black text-stone-700">{stats.service}</span>
              </div>

              {/* Ambiance Sub-stat */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                    <Heart size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-stone-600">{lang === "ar" ? "الأجواء والنظافة" : "Ambiance"}</p>
                    {renderStarsList(stats.ambiance)}
                  </div>
                </div>
                <span className="text-lg font-black text-stone-700">{stats.ambiance}</span>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col xl:flex-row gap-4 items-center justify-between bg-stone-50/20 p-4 rounded-2xl border border-stone-100">
            <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
              {/* Restaurant Filter */}
              <select
                value={restaurantFilter}
                onChange={(e) => setRestaurantFilter(e.target.value)}
                className="bg-white px-4 py-2.5 rounded-xl border border-stone-200 font-bold text-stone-600 text-xs outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="all">{lang === "ar" ? "جميع المطاعم" : "All Restaurants"}</option>
                <option value="italian">{lang === "ar" ? "مطعم إيطالي" : "Italian Restaurant"}</option>
                <option value="oriental">{lang === "ar" ? "مطعم شرقي" : "Oriental Restaurant"}</option>
              </select>

              {/* Rating Filter */}
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="bg-white px-4 py-2.5 rounded-xl border border-stone-200 font-bold text-stone-600 text-xs outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="all">{lang === "ar" ? "جميع التقييمات" : "All Ratings"}</option>
                <option value="5">⭐⭐⭐⭐⭐ {lang === "ar" ? "ممتاز" : "Excellent"}</option>
                <option value="4">⭐⭐⭐⭐ {lang === "ar" ? "جيد جداً" : "Very Good"}</option>
                <option value="3">⭐⭐⭐ {lang === "ar" ? "متوسط" : "Average"}</option>
                <option value="2">⭐⭐ {lang === "ar" ? "بحاجة لتحسين" : "Needs Improvement"}</option>
              </select>
            </div>

            {/* Search */}
            <div className="relative w-full xl:w-72">
              <input
                type="text"
                placeholder={lang === "ar" ? "البحث في التعليقات أو الأسماء..." : "Search comments, names..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full bg-white px-4 py-2.5 rounded-xl outline-none border border-stone-200 text-xs font-bold focus:ring-2 focus:ring-brand-blue transition-all ${
                  t.dir === "rtl" ? "pr-9" : "pl-9"
                }`}
              />
              <Search
                size={16}
                className="absolute top-1/2 -translate-y-1/2 text-stone-400"
                style={{ [t.dir === "rtl" ? "right" : "left"]: "0.75rem" }}
              />
            </div>
          </div>

          {/* Feedback list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredFeedbacks.length === 0 ? (
              <div className="col-span-full py-12 text-center text-stone-400 font-bold border border-stone-100 rounded-3xl bg-stone-50/20">
                {lang === "ar" ? "لا توجد نتائج مطابقة لبحثك." : "No reviews match your search."}
              </div>
            ) : (
              filteredFeedbacks.map((item) => {
                const isItalian = item.restaurant?.includes("إيطالي") || item.resId === "italian";
                return (
                  <div
                    key={item.id}
                    className="bg-white p-6 rounded-3xl border border-stone-100 hover:shadow-md hover:border-amber-200/50 transition-all flex flex-col justify-between relative group"
                  >
                    {/* Header line */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h4 className="font-black text-brand-blue text-sm">
                          {item.customerName} <span className="text-stone-400 text-xs font-medium">(Room {item.room})</span>
                        </h4>
                        <span className="text-[10px] text-stone-400 font-bold block mt-0.5">
                          {item.timestamp?.toLocaleString(lang === "ar" ? "ar-EG" : "en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border tracking-wider ${
                          isItalian
                            ? "bg-blue-50 text-blue-600 border-blue-100"
                            : "bg-orange-50 text-orange-600 border-orange-100"
                        }`}
                      >
                        {isItalian ? (lang === "ar" ? "إيطالي" : "Italian") : (lang === "ar" ? "شرقي" : "Oriental")}
                      </span>
                    </div>

                    {/* Ratings row breakdown */}
                    <div className="bg-stone-50/50 p-3 rounded-xl border border-stone-100/50 mb-3 grid grid-cols-2 gap-2 text-[10px] font-bold text-stone-500">
                      <div className="flex items-center justify-between">
                        <span>{lang === "ar" ? "العام:" : "Overall:"}</span>
                        {renderStarsList(item.rating)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{lang === "ar" ? "الطعام:" : "Food:"}</span>
                        {renderStarsList(item.foodRating)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{lang === "ar" ? "الخدمة:" : "Service:"}</span>
                        {renderStarsList(item.serviceRating)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{lang === "ar" ? "الأجواء:" : "Ambiance:"}</span>
                        {renderStarsList(item.ambianceRating)}
                      </div>
                    </div>

                    {/* Comment text */}
                    {item.comment ? (
                      <div className="bg-stone-50/30 p-3.5 rounded-xl border border-dashed border-stone-200/60 text-xs text-stone-600 leading-relaxed font-semibold italic flex gap-2 items-start relative mt-1 flex-grow">
                        <MessageSquareIcon size={14} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="flex-grow">&ldquo;{item.comment}&rdquo;</p>
                      </div>
                    ) : (
                      <div className="text-stone-300 text-xs font-bold italic flex-grow flex items-center justify-center p-3">
                        {lang === "ar" ? "لا توجد ملاحظات مكتوبة" : "No written comments"}
                      </div>
                    )}

                    {/* Trash Delete Action */}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      style={{ transitionDelay: "50ms" }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
});

