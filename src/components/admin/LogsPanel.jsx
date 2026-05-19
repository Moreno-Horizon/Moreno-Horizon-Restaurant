import React from "react";

const LogsPanel = React.memo(function LogsPanel({ logs, t, lang }) {
  const getActionStyles = (action, lang) => {
    const normalized = action?.toLowerCase() || "";
    
    if (normalized.includes("delete")) {
      return {
        bg: "bg-rose-500/10 dark:bg-rose-500/20",
        text: "text-rose-600 dark:text-rose-400",
        border: "border-rose-200/50 dark:border-rose-500/30",
        label: lang === "ar" ? "حذف" : "Delete"
      };
    }
    if (normalized.includes("complete")) {
      return {
        bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
        text: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-200/50 dark:border-emerald-500/30",
        label: lang === "ar" ? "إكمال" : "Complete"
      };
    }
    if (normalized.includes("add") || normalized.includes("create")) {
      return {
        bg: "bg-amber-500/10 dark:bg-amber-500/20",
        text: "text-amber-600 dark:text-amber-400",
        border: "border-amber-200/50 dark:border-amber-500/30",
        label: lang === "ar" ? "إضافة" : "Add"
      };
    }
    if (normalized.includes("reminder") || normalized.includes("send")) {
      return {
        bg: "bg-sky-500/10 dark:bg-sky-500/20",
        text: "text-sky-600 dark:text-sky-400",
        border: "border-sky-200/50 dark:border-sky-500/30",
        label: lang === "ar" ? "تذكير" : "Reminder"
      };
    }
    if (normalized.includes("assign") || normalized.includes("seat")) {
      return {
        bg: "bg-violet-500/10 dark:bg-violet-500/20",
        text: "text-violet-600 dark:text-violet-400",
        border: "border-violet-200/50 dark:border-violet-500/30",
        label: lang === "ar" ? "تسكين طاولة" : "Assign Table"
      };
    }
    return {
      bg: "bg-stone-500/10 dark:bg-stone-400/10",
      text: "text-stone-600 dark:text-stone-400",
      border: "border-stone-200/50 dark:border-stone-700/50",
      label: action
    };
  };

  return (
    <div className="bg-white/90 dark:bg-stone-900/80 backdrop-blur-md rounded-3xl p-4 md:p-8 shadow-xl shadow-stone-200/50 dark:shadow-black/50 border border-stone-100/50 dark:border-stone-800/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-stone-800 dark:text-white">
            {lang === "ar" ? "نظام مراقبة العمليات" : "Operation Audit Logs"}
          </h2>
          <p className="text-stone-400 dark:text-stone-500 text-xs mt-1 font-bold">
            {lang === "ar" ? "سجل الحركات والعمليات في النظام" : "Log of actions and operations in the system"}
          </p>
        </div>
        <div className="bg-brand-orange/10 dark:bg-brand-orange/20 text-brand-orange px-4 py-2 rounded-xl text-xs font-black border border-brand-orange/20 dark:border-brand-orange/30">
          {logs.length} {lang === "ar" ? "حركة" : "Logs"}
        </div>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {logs.map((log) => {
          const date = log.timestamp?.toDate ? log.timestamp.toDate() : new Date();
          const timeStr = date.toLocaleTimeString(lang === "ar" ? "ar-EG" : "en-US", { hour: '2-digit', minute: '2-digit' });
          const dateStr = date.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", { month: 'short', day: 'numeric' });
          const badge = getActionStyles(log.action, lang);
          
          return (
            <div key={log.id} className="bg-stone-50/50 dark:bg-stone-900/40 hover:bg-stone-100/80 dark:hover:bg-stone-800/40 p-4 rounded-2xl border border-stone-100/30 dark:border-stone-800/50 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm hover:shadow">
              <div className="flex items-start gap-3">
                <div className="bg-gradient-to-tr from-brand-orange to-orange-400 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 shadow-sm shadow-brand-orange/20">
                  {log.userName ? log.userName.substring(0, 2).toUpperCase() : "??"}
                </div>
                <div>
                  <p className="text-stone-800 dark:text-stone-200 text-xs font-bold leading-relaxed">
                    <span className="font-black text-brand-orange dark:text-brand-orange">{log.userName}</span> {log.details}
                  </p>
                  <p className="text-stone-400 dark:text-stone-500 text-[10px] font-bold mt-1">
                    {dateStr} | {timeStr}
                  </p>
                </div>
              </div>
              <div className={`text-[9px] font-black ${badge.text} ${badge.bg} px-3 py-1 rounded-lg border ${badge.border} uppercase tracking-wider self-start md:self-auto shadow-sm`}>
                {badge.label}
              </div>
            </div>
          );
        })}
        {logs.length === 0 && (
          <div className="text-center text-stone-400 py-8 text-xs font-bold">
            {lang === "ar" ? "لا توجد حركات مسجلة بعد" : "No logs recorded yet"}
          </div>
        )}
      </div>
    </div>
  );
});

export default LogsPanel;
