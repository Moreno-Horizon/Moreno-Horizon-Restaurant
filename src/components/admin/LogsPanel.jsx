import React from "react";

const LogsPanel = React.memo(function LogsPanel({ logs, t, lang }) {
  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl p-4 md:p-8 shadow-xl shadow-stone-200/50 border border-stone-100/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-stone-800">
            {lang === "ar" ? "نظام مراقبة العمليات" : "Operation Audit Logs"}
          </h2>
          <p className="text-stone-400 text-xs mt-1 font-bold">
            {lang === "ar" ? "سجل الحركات والعمليات في النظام" : "Log of actions and operations in the system"}
          </p>
        </div>
        <div className="bg-stone-50 text-stone-600 px-4 py-2 rounded-xl text-xs font-black border border-stone-200">
          {logs.length} {lang === "ar" ? "حركة" : "Logs"}
        </div>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {logs.map((log) => {
          const date = log.timestamp?.toDate ? log.timestamp.toDate() : new Date();
          const timeStr = date.toLocaleTimeString(lang === "ar" ? "ar-EG" : "en-US", { hour: '2-digit', minute: '2-digit' });
          const dateStr = date.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", { month: 'short', day: 'numeric' });
          
          return (
            <div key={log.id} className="bg-stone-50 hover:bg-stone-100/50 p-4 rounded-2xl border border-stone-100 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="bg-stone-200 text-stone-600 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0">
                  {log.userName ? log.userName.substring(0, 2).toUpperCase() : "??"}
                </div>
                <div>
                  <p className="text-stone-800 text-xs font-bold">
                    <span className="font-black text-brand-blue">{log.userName}</span> {log.details}
                  </p>
                  <p className="text-stone-400 text-[10px] font-bold mt-0.5">
                    {dateStr} | {timeStr}
                  </p>
                </div>
              </div>
              <div className="text-[10px] font-black text-stone-500 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200 uppercase tracking-wider self-start md:self-auto">
                {log.action}
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
