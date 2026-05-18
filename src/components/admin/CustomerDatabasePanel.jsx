import React, { useState, useEffect, useMemo } from "react";
import { Users, PieChart, Printer, Search } from "lucide-react";

const CustomerDatabasePanel = React.memo(function CustomerDatabasePanel({
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

  const customers = useMemo(() => {
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

  const filtered = useMemo(() => {
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        c.phone.includes(debouncedSearch) ||
        (c.room && c.room.includes(debouncedSearch)),
    );
  }, [customers, debouncedSearch]);

  const visibleItems = useMemo(() => {
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

export default CustomerDatabasePanel;
