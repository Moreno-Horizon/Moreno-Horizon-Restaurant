import React, { useMemo } from "react";
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
import { BarChart } from "lucide-react";

const AnalyticsDashboard = React.memo(function AnalyticsDashboard({
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

export default AnalyticsDashboard;
