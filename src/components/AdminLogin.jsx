import { useState } from "react";
import { Lock, User, Eye, EyeOff, ShieldCheck } from "lucide-react";

const AdminLogin = ({ adminUser, setAdminUser, adminPass, setAdminPass, onLogin, t, lang }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isRtl = t.dir === "rtl";

  return (
    <div className="max-w-md mx-auto w-full py-6 animate-fade-scale">
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          onLogin();
        }}
        className="glass-card p-10 rounded-[3rem] text-center border border-stone-100/50 shadow-2xl relative overflow-hidden"
      >
        {/* Background Decorative Ambient light */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-brand-orange/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-brand-orange/10 blur-3xl pointer-events-none" />

        {/* Header Icon & Brand title */}
        <div className="mb-8 flex flex-col items-center relative z-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-brand-orange to-orange-400 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-orange/20 mb-4 animate-float">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-serif text-brand-blue dark:text-white font-black tracking-tight mb-2">
            {t.adminLogin}
          </h2>
          <p className="text-[10px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-[0.2em]">
            {lang === "ar" ? "لوحة الإدارة والموظفين" : "Administration & Staff Panel"}
          </p>
        </div>

        {/* Inputs Group */}
        <div className="space-y-4 mb-6 relative z-10">
          {/* Username */}
          <div className="relative group">
            <div className={`absolute ${isRtl ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-brand-orange transition-colors`}>
              <User size={20} />
            </div>
            <input
              type="text"
              value={adminUser}
              onChange={(e) => setAdminUser(e.target.value)}
              placeholder={t.username}
              className={`w-full bg-stone-50 dark:bg-stone-900/40 ${isRtl ? "pr-12 pl-6" : "pl-12 pr-6"} py-4.5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-orange border border-stone-200/50 dark:border-stone-800/80 transition-all font-bold text-base text-stone-800 dark:text-stone-100 placeholder-stone-400`}
              required
            />
          </div>

          {/* Password */}
          <div className="relative group">
            <div className={`absolute ${isRtl ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-brand-orange transition-colors`}>
              <Lock size={20} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={adminPass}
              onChange={(e) => setAdminPass(e.target.value)}
              placeholder={t.password}
              className={`w-full bg-stone-50 dark:bg-stone-900/40 ${isRtl ? "pr-12 pl-12" : "pl-12 pr-12"} py-4.5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-orange border border-stone-200/50 dark:border-stone-800/80 transition-all font-bold text-base text-stone-800 dark:text-stone-100 placeholder-stone-400`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute ${isRtl ? "left-4" : "right-4"} top-1/2 -translate-y-1/2 text-stone-400 hover:text-brand-orange transition-colors p-1 cursor-pointer`}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-brand-orange text-white py-4.5 rounded-2xl font-black text-lg transition-all duration-300 active:scale-95 shadow-lg shadow-brand-orange/25 hover:shadow-xl hover:shadow-brand-orange/35 btn-premium mt-2 relative z-10"
        >
          {t.login}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
