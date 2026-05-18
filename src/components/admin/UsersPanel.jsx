import React, { useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const secondaryApp = getApps().find(app => app.name === "Secondary") || initializeApp(firebaseConfig, "Secondary");
const secondaryAuth = getAuth(secondaryApp);
import { doc, setDoc, deleteDoc, serverTimestamp, collection, addDoc } from "firebase/firestore";
import { Users, RefreshCw, Plus, Edit, Trash2, Check, X } from "lucide-react";




const UserRow = ({ user, t, db, onDelete, lang, showToast, fetchUsers }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...user });

  const handleUpdate = async () => {
    try {
      await setDoc(doc(db, "users", user.id), {
        ...editData,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      
      setIsEditing(false);
      
      if (showToast) {
        showToast(lang === "ar" ? "تم تحديث البيانات بنجاح" : "Data updated successfully");
      }
      if (fetchUsers) await fetchUsers();
    } catch (e) {
      console.error(e);
      if (showToast) {
        if (e.code === "permission-denied") {
          showToast(lang === "ar" ? "ليس لديك صلاحية لتعديل المستخدمين" : "You do not have permission to edit users");
        } else {
          showToast(lang === "ar" ? "حدث خطأ أثناء التحديث" : "An error occurred during update");
        }
      }
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
            <option value="staff">{lang === "ar" ? "موظف" : "Staff"}</option>
            <option value="manager">{lang === "ar" ? "مدير" : "Manager"}</option>
            <option value="main">{lang === "ar" ? "أدمن" : "Admin"}</option>
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
          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
            user.role === "main" 
              ? "bg-brand-blue text-white" 
              : user.role === "manager"
                ? "bg-emerald-500 text-white"
                : "bg-stone-100 text-stone-500"
          }`}
        >
          {user.role === "main" 
            ? (lang === "ar" ? "أدمن" : "Admin")
            : user.role === "manager"
              ? (lang === "ar" ? "مدير" : "Manager")
              : (lang === "ar" ? "موظف" : "Staff")}
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

const UsersPanel = React.memo(function UsersPanel({
  users,
  t,
  db,
  showToast,
  lang,
  addLog,
  fetchUsers,
}) {
  const [newUserName, setNewUserName] = useState("");
  const [newUserUsername, setNewUserUsername] = useState("");
  const [newUserPass, setNewUserPass] = useState("");
  const [newUserRole, setNewUserRole] = useState("staff");

  const handleAddUser = async () => {
    if (!newUserName || !newUserUsername || !newUserPass) return;
    try {
      const email = newUserUsername.includes("@") ? newUserUsername : `${newUserUsername}@lamama.com`;
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, newUserPass);
      const user = userCredential.user;
      
      await setDoc(doc(db, "users", user.uid), {
        name: newUserName,
        username: newUserUsername,
        password: newUserPass,
        role: newUserRole,
        createdAt: serverTimestamp(),
      });
      
      try {
        await secondaryAuth.signOut();
      } catch (e) {
        console.error("Error signing out from secondary app:", e);
      }
      if (addLog) {
        await addLog("add_user", `${lang === "ar" ? "إضافة مستخدم" : "Added user"} ${newUserUsername}`);
      }
      
      setNewUserName("");
      setNewUserUsername("");
      setNewUserPass("");
      showToast(t.userAddedSuccess);
      if (fetchUsers) await fetchUsers();
    } catch (e) {
      console.error(e);
      if (showToast) {
      if (e.code === "auth/email-already-in-use") {
        showToast(lang === "ar" ? "اسم المستخدم هذا مسجل بالفعل في النظام! يرجى اختيار اسم مستخدم آخر." : "This username is already in use in the system! Please choose another.");
      } else if (e.code === "permission-denied") {
        showToast(lang === "ar" ? "فشل الحفظ: تأكد من تطبيق خطوات الـ UID السابقة أو عطل القواعد مؤقتاً" : "Permission denied: Apply UID steps or disable rules temporarily");
      } else {
        showToast(lang === "ar" ? `فشل الإضافة: ${e.message}` : `Failed to add user: ${e.message}`);
      }
      }
    }
  };

  const handleDeleteUser = async (id) => {
    const confirmMsg = t.confirmDelete;
    if (!window.confirm(confirmMsg)) return;
    try {
      const userToDelete = users.find(u => u.id === id);
      await deleteDoc(doc(db, "users", id));
      if (addLog) {
        await addLog("delete_user", `${lang === "ar" ? "حذف مستخدم" : "Deleted user"} ${userToDelete?.username || id}`);
      }
      if (fetchUsers) await fetchUsers();
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
          <option value="staff">{lang === "ar" ? "موظف" : "Staff"}</option>
          <option value="manager">{lang === "ar" ? "مدير" : "Manager"}</option>
          <option value="main">{lang === "ar" ? "أدمن" : "Admin"}</option>
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
              <UserRow key={user.id} user={user} t={t} db={db} onDelete={handleDeleteUser} lang={lang} showToast={showToast} fetchUsers={fetchUsers} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default UsersPanel;
