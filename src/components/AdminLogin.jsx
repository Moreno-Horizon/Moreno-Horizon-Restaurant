
import { Lock } from "lucide-react";

const AdminLogin = ({ adminUser, setAdminUser, adminPass, setAdminPass, onLogin, t }) => {
  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
        onLogin();
      }}
      className="max-w-md mx-auto bg-white p-10 rounded-[2.5rem] shadow-2xl text-center border border-stone-100 mt-10"
    >
      <div className="w-20 h-20 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <Lock size={40} className="text-brand-blue" />
      </div>
      <h2 className="text-3xl font-serif text-brand-blue mb-8">
        {t.adminLogin}
      </h2>
      <input
        type="text"
        value={adminUser}
        onChange={(e) => setAdminUser(e.target.value)}
        placeholder={t.username}
        className="w-full bg-stone-50 p-5 rounded-2xl mb-4 outline-none focus:ring-2 focus:ring-brand-blue text-center font-bold text-lg border border-stone-200"
      />
      <input
        type="password"
        value={adminPass}
        onChange={(e) => setAdminPass(e.target.value)}
        placeholder={t.password}
        className="w-full bg-stone-50 p-5 rounded-2xl mb-6 outline-none focus:ring-2 focus:ring-brand-blue text-center font-bold text-lg border border-stone-200"
      />
      <button
        type="submit"
        className="w-full bg-brand-blue text-white py-5 rounded-2xl font-bold text-xl hover:bg-brand-blueHover shadow-lg transition-all"
      >
        {t.login}
      </button>
    </form>
  );
};

export default AdminLogin;
