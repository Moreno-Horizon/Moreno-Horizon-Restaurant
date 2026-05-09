import React, { useState, useEffect } from "react";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  ShoppingBag,
  X,
  Menu,
  Globe,
  ArrowRight,
  User,
  Phone,
  Calendar,
  Clock,
  Users,
  ChevronDown,
  Check,
  Plus,
  MapPin,
  Mail,
  MessageCircle,
  Lock,
  CheckCircle,
  XCircle,
  Trash2,
  Settings,
  Search,
  Key,
  Edit,
  Star,
  Moon,
  Sun,
  Printer,
  BarChart,
  PieChart,
  QrCode,
  Home,
  AlertTriangle,
  UserX,
  Send,
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
      <div className="mt-10 flex justify-end">
        <button
          onClick={() => onSave(localSettings)}
          className="bg-brand-blue text-white px-10 py-4 rounded-2xl font-bold hover:bg-brand-blueHover transition-all shadow-lg flex items-center gap-2"
        >
          <CheckCircle size={20} />
          {t.saveSettings}
        </button>
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
      await addDoc(collection(db, "users"), {
        name: newUserName,
        username: newUserUsername,
        password: newUserPass,
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
  blacklist,
  t,
  db,
  showToast,
}) {
  const [newValue, setNewValue] = useState("");
  const handleAdd = async () => {
    if (!newValue) return;
    await addDoc(collection(db, "blacklist"), {
      value: newValue,
      createdAt: serverTimestamp(),
    });
    setNewValue("");
    if (showToast) showToast(t.success);
  };
  const handleDelete = async (id) => {
    if (!window.confirm(t.confirmDelete)) return;
    await deleteDoc(doc(db, "blacklist", id));
  };
  return (
    <div
      className="glass-card hover-lift p-8 rounded-[2.5rem] shadow-xl border border-stone-100/50 animate-fade-scale mt-12 overflow-hidden"
      style={{ animationDelay: "0.2s" }}
    >
      <h3 className="text-xl font-bold text-brand-blue mb-8 flex items-center gap-3">
        <UserX size={24} className="text-red-500" />
        {t.manageBlacklist}
      </h3>
      <div className="flex gap-4 mb-8 bg-stone-50 p-6 rounded-2xl border border-stone-100">
        <input
          type="text"
          placeholder={t.phone + " / " + t.roomNumber}
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="flex-1 bg-white p-3 rounded-xl border border-stone-200 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-blue"
        />
        <button
          onClick={handleAdd}
          className="bg-red-500 text-white px-6 rounded-xl font-bold hover:bg-red-600 transition-all shadow-md"
        >
          {t.addToBlacklist}
        </button>
      </div>
      <div className="flex flex-wrap gap-3">
        {blacklist.map((item) => (
          <div
            key={item.id}
            className="bg-red-50 text-red-600 px-4 py-2 rounded-full font-bold flex items-center gap-3 border border-red-100"
          >
            {item.value}
            <X
              size={16}
              className="cursor-pointer"
              onClick={() => handleDelete(item.id)}
            />
          </div>
        ))}
      </div>
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

import { translations } from "../translations";

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
