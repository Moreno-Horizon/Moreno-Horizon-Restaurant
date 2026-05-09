import React, { memo, useState, useEffect, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Search,
  BarChart,
  Printer,
  QrCode,
  Users,
  CheckCircle,
  XCircle,
  Check,
  Trash2,
  Mail,
  Plus,
  Edit,
  Utensils,
} from "lucide-react";
import AdminLogin from "./AdminLogin";
import {
  SettingsPanel,
  UsersPanel,
  BlacklistPanel,
  BestSellersChart,
  CustomerDatabasePanel,
} from "./AdminPanels";
import {
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  collection,
  where,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { translations } from "../translations";

function AdminView({
  t,
  italianTodayAvail,
  orientalTodayAvail,
  bookings,
  todayStr,
  weeklyData,
  maxWeeklyCount,
  settings,
  lang,
  users,
  db,
  showToast,
  blacklist,
  MENU_ITEMS,
}) {
  // --- Admin Auth & User States ---
  const [isAdminAuth, setIsAdminAuth] = useState(
    () => localStorage.getItem("morenoAdminAuth") === "true",
  );
  const [currentUser, setCurrentUser] = useState(() =>
    JSON.parse(localStorage.getItem("morenoCurrentUser") || "null"),
  );
  const [adminRole, setAdminRole] = useState(() =>
    localStorage.getItem("morenoAdminRole"),
  ); // 'main' or 'staff'
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");

  const handleAdminLogin = async () => {
    if (
      adminUser.toLowerCase() === "admin" &&
      adminPass === settings.adminPass
    ) {
      const adminData = { name: "Admin", username: "admin", role: "main" };
      setAdminRole("main");
      setCurrentUser(adminData);
      setIsAdminAuth(true);
      localStorage.setItem("morenoAdminAuth", "true");
      localStorage.setItem("morenoAdminRole", "main");
      localStorage.setItem("morenoCurrentUser", JSON.stringify(adminData));
      return;
    }

    // Check users collection
    try {
      const userQuery = query(
        collection(db, "users"),
        where("username", "==", adminUser),
        where("password", "==", adminPass),
      );
      const userSnap = await getDocs(userQuery);
      if (!userSnap.empty) {
        const userData = userSnap.docs[0].data();
        const adminData = {
          name: userData.name,
          username: userData.username,
          role: userData.role,
        };
        setAdminRole(userData.role);
        setCurrentUser(adminData);
        setIsAdminAuth(true);
        // Persist session
        localStorage.setItem("morenoAdminAuth", "true");
        localStorage.setItem("morenoAdminRole", userData.role);
        localStorage.setItem("morenoCurrentUser", JSON.stringify(adminData));
      } else {
        showToast(t.wrongPassword);
      }
    } catch (e) {
      console.error("Login Error:", e);
      showToast(t.wrongPassword);
    }
  };

  // --- Admin Filter States ---
  const [adminTab, setAdminTab] = useState("all");
  const [adminSearch, setAdminSearch] = useState("");
  const [debouncedAdminSearch, setDebouncedAdminSearch] = useState("");
  const [adminStartDate, setAdminStartDate] = useState(todayStr);
  const [adminEndDate, setAdminEndDate] = useState(todayStr);
  const [editingBooking, setEditingBooking] = useState(null);

  const dateRangeLabel = useMemo(() => {
    if (!adminStartDate && !adminEndDate) return "all";
    if (adminStartDate === adminEndDate) return adminStartDate;
    if (adminStartDate && adminEndDate) return `${adminStartDate}_to_${adminEndDate}`;
    return adminStartDate || adminEndDate;
  }, [adminStartDate, adminEndDate]);

  const isSuperAdmin = useMemo(
    () => currentUser?.username?.toLowerCase() === "admin",
    [currentUser],
  );

  // Pre-compute yesterday once — avoids 3x inline computation per render
  const yesterdayStr = useMemo(() => {
    const d = new Date(Date.now() - 86400000);
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().split("T")[0];
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedAdminSearch(adminSearch);
    }, 300);
    return () => clearTimeout(handler);
  }, [adminSearch]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesSearch =
        b.name?.toLowerCase().includes(debouncedAdminSearch.toLowerCase()) ||
        b.phone?.includes(debouncedAdminSearch) ||
        (b.room && b.room.includes(debouncedAdminSearch));
      const matchesTab = adminTab === "all" || b.status === adminTab;

      if (debouncedAdminSearch) return matchesSearch && matchesTab;

      let matchesDate = true;
      if (adminStartDate && adminEndDate) {
        matchesDate = b.date >= adminStartDate && b.date <= adminEndDate;
      } else if (adminStartDate) {
        matchesDate = b.date >= adminStartDate;
      } else if (adminEndDate) {
        matchesDate = b.date <= adminEndDate;
      }

      return matchesDate && matchesTab;
    });
  }, [bookings, debouncedAdminSearch, adminTab, adminStartDate, adminEndDate]);

  // --- Functions ---
  const updateSettingsInDB = useCallback(
    async (newSettings) => {
      try {
        const sanitizedSettings = Object.fromEntries(
          Object.entries(newSettings).filter(([_, v]) => v !== undefined),
        );

        // Timeout wrapper for setDoc to prevent infinite hang
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Timeout: Firebase connection blocked")),
            8000,
          ),
        );

        await Promise.race([
          setDoc(doc(db, "settings", "general"), sanitizedSettings, {
            merge: true,
          }),
          timeoutPromise,
        ]);

        showToast(t.settingsUpdated || "تم حفظ الإعدادات بنجاح!");
      } catch (e) {
        console.error("Error saving settings:", e);
        showToast(t.errorSavingSettings || "حدث خطأ أثناء حفظ الإعدادات");
      }
    },
    [t, db, showToast],
  );

  const printReceipt = useCallback(
    (booking) => {
      const curLang = t;
      let cleanOrderDetails = curLang.noFoodOrders;
      if (booking.items && booking.items.length > 0) {
        cleanOrderDetails = booking.items
          .map((item) => `- ${item.qty}x ${item.name[lang] || item.name["en"]}`)
          .join("\n");
      } else if (booking.orderDetails) {
        cleanOrderDetails = booking.orderDetails;
      }

      const isItalian =
        booking.resId === "italian" ||
        (booking.restaurant &&
          (booking.restaurant.includes("Italian") ||
            booking.restaurant.includes("إيطالي")));
      const resNamePrint = isItalian ? curLang.italian : curLang.oriental;

      const html = `
            <!DOCTYPE html>
            <html dir="${curLang.dir}">
            <head>
                <meta charset="utf-8">
                <title>${curLang.receipt} MH-${booking.id.toString().slice(-4)}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
                    body {
                        font-family: 'Cairo', sans-serif;
                        margin: 0;
                        padding: 20px;
                        display: flex;
                        justify-content: center;
                        background: #fff;
                        direction: ${curLang.dir};
                    }
                    .receipt { width: 100%; max-width: 400px; }
                    .header { text-align: center; margin-bottom: 25px; }
                    .header h1 { margin: 0; font-size: 28px; color: #000; font-weight: 900; }
                    .header p { margin: 5px 0 0; font-size: 14px; color: #333; }
                    .divider { border-top: 2px dashed #000; margin: 20px 0; }
                    .info-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 15px; color: #000; }
                    .info-row strong { font-weight: bold; }
                    .order-details { 
                        margin-top: 20px; font-size: 15px; color: #000; 
                        white-space: pre-wrap; padding: 10px; border: 1px dashed #000; line-height: 1.8;
                    }
                    .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #333; }
                    @page { size: auto; margin: 0mm; }
                    body { margin: 15mm; }
                </style>
            </head>
            <body>
                <div class="receipt">
                    <div class="header">
                        <img src="${window.location.origin}/logo.webp" alt="Moreno Horizon" style="max-width: 140px; height: auto; margin-bottom: 15px; display: inline-block;" />
                        <h1>${curLang.brand}</h1>
                        <p>${curLang.receipt} #MH-${booking.id.toString().slice(-4)}</p>
                    </div>
                    <div class="divider"></div>
                    <div class="info-row"><span>${curLang.bookingName}:</span><strong>${booking.name}</strong></div>
                    <div class="info-row"><span>${curLang.room}:</span><strong>${booking.room}</strong></div>
                    <div class="info-row"><span>${curLang.date}:</span><strong>${booking.date}</strong></div>
                    <div class="info-row"><span>${curLang.time}:</span><strong>${booking.time}</strong></div>
                    <div class="info-row"><span>${curLang.restaurantType}:</span><strong>${resNamePrint}</strong></div>
                    <div class="info-row"><span>${curLang.bookingGuests}:</span><strong>${booking.guests}</strong></div>
                    <div class="divider"></div>
                    <div class="order-details">${cleanOrderDetails}</div>
                    <div class="divider"></div>
                    <div class="footer">
                        <p>${curLang.thankYou}</p>
                        <p style="margin-top: 10px; font-weight: bold; font-size: 12px; color: #666;">${curLang.designedBy}</p>
                    </div>
                </div>
            </body>
            </html>
        `;

      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
        }, 500);
      } else {
        showToast(t.allowPopups);
      }
    },
    [t, lang],
  );

  const printDailyReport = useCallback(
    (restaurantId = null) => {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        showToast(t.allowPopups);
        return;
      }

      const reportT = translations.en;
      const isItalianBooking = (b) => {
        const rId = (b.resId || "").toLowerCase();
        const rName = (b.restaurant || "").toLowerCase();
        return (
          rId === "italian" ||
          rName.includes("italian") ||
          rName.includes("إيطالي") ||
          rName.includes("ايطالي")
        );
      };
      const isOrientalBooking = (b) => {
        const rId = (b.resId || "").toLowerCase();
        const rName = (b.restaurant || "").toLowerCase();
        return (
          rId === "oriental" ||
          rName.includes("oriental") ||
          rName.includes("شرقي") ||
          rName.includes("عربي")
        );
      };

      const bookingsToPrint = restaurantId
        ? filteredBookings.filter((b) => {
            if (restaurantId === "italian") return isItalianBooking(b);
            if (restaurantId === "oriental") return isOrientalBooking(b);
            return true;
          })
        : filteredBookings;

      const totalPax = bookingsToPrint.reduce(
        (sum, b) => sum + (parseInt(b.guests) || 0),
        0,
      );
      const restaurantTitle = restaurantId
        ? restaurantId === "italian"
          ? " - Italian Restaurant"
          : " - Oriental Restaurant"
        : "";

      const renderTable = (items, title) => {
        const pax = items.reduce(
          (sum, b) => sum + (parseInt(b.guests) || 0),
          0,
        );

        return `
        <div style="margin-top: 30px;">
          <h2 style="font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">${title}</h2>
          <table>
            <thead>
              <tr>
                <th>${reportT.time}</th>
                <th>${reportT.bookingName}</th>
                <th>${reportT.room}</th>
                <th>${reportT.guests}</th>
                <th>Order Details</th>
                <th>Notes</th>
                <th>${reportT.status}</th>
              </tr>
            </thead>
            <tbody>
              ${
                items.length === 0
                  ? `<tr><td colspan="7" style="text-align: center; font-style: italic; color: #888; padding: 15px;">No bookings</td></tr>`
                  : items
                      .map((b) => {
                        const engStatus =
                          b.status === "pending"
                            ? "Pending"
                            : b.status === "confirmed"
                              ? "Confirmed"
                              : b.status === "waitlist"
                                ? "Waitlist"
                                : b.status === "cancelled"
                                  ? "Cancelled"
                                  : "Completed";

                        const engOrder =
                          b.items && b.items.length > 0
                            ? b.items
                                .map((i) => {
                                  const m = MENU_ITEMS.find(
                                    (item) => item.id === i.id,
                                  );
                                  const itemName = m
                                    ? m.name?.en || m.name?.ar || m.name
                                    : i.name || i.id;
                                  return `<b>${i.qty}x</b> ${itemName}`;
                                })
                                .join("<br/>")
                            : "-";

                        return `
                      <tr>
                        <td>${b.time}</td>
                        <td>${b.name}</td>
                        <td>${b.room}</td>
                        <td style="text-align: center;">${b.guests}</td>
                        <td style="font-size: 11px; line-height: 1.4;">${engOrder}</td>
                        <td style="font-size: 11px;">${b.notes || "-"}</td>
                        <td>${engStatus}</td>
                      </tr>
                    `;
                      })
                      .join("")
              }
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="3" style="text-align: right;">${reportT.totalPax}:</td>
                <td style="text-align: center;">${pax}</td>
                <td colspan="2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      `;
      };

      const italianBookings = bookingsToPrint.filter(isItalianBooking);
      const orientalBookings = bookingsToPrint.filter(isOrientalBooking);
      const otherBookings = bookingsToPrint.filter(
        (b) => !isItalianBooking(b) && !isOrientalBooking(b),
      );

      const content = `
      <html>
        <head>
          <title>${reportT.dailyReport}${restaurantTitle} - ${dateRangeLabel}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
            body { font-family: 'Cairo', sans-serif; padding: 40px; direction: ltr; color: #1c1917; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #e7e5e4; padding-bottom: 20px; }
            h1 { margin: 0; font-size: 24px; color: #1c1917; }
            .date { color: #78716c; font-weight: bold; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
            th, td { border: 1px solid #e7e5e4; padding: 10px 8px; text-align: left; }
            th { background-color: #f5f5f4; font-weight: bold; }
            .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #a8a29e; border-top: 1px solid #e7e5e4; padding-top: 20px; }
            .total-row { background-color: #f5f5f4; font-weight: bold; }
            @page { size: auto; margin: 0mm; }
            body { margin: 15mm; }
            h2 { color: #f97316; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${reportT.dailyReport}${restaurantTitle}</h1>
            <div class="date">${dateRangeLabel}</div>
          </div>
          
          ${
            restaurantId === "italian"
              ? renderTable(italianBookings, "Italian Restaurant")
              : restaurantId === "oriental"
                ? renderTable(orientalBookings, "Oriental Restaurant")
                : `
              ${renderTable(italianBookings, "Italian Restaurant")}
              ${renderTable(orientalBookings, "Oriental Restaurant")}
              ${renderTable(otherBookings, "Other Bookings")}
            `
          }

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
    },
    [filteredBookings, dateRangeLabel, t, MENU_ITEMS],
  );

  const sendEmailReport = useCallback(async () => {
    if (!settings.reportEmail) {
      showToast(t.incompleteBooking);
      return;
    }

    showToast(t.savingReservation);

    const isItalianBooking = (b) => {
      const rId = (b.resId || "").toLowerCase();
      const rName = (b.restaurant || "").toLowerCase();
      return (
        rId === "italian" ||
        rName.includes("italian") ||
        rName.includes("إيطالي") ||
        rName.includes("ايطالي")
      );
    };

    const isOrientalBooking = (b) => {
      const rId = (b.resId || "").toLowerCase();
      const rName = (b.restaurant || "").toLowerCase();
      return (
        rId === "oriental" ||
        rName.includes("oriental") ||
        rName.includes("شرقي") ||
        rName.includes("عربي")
      );
    };

    const italianBookings = filteredBookings.filter(isItalianBooking);
    const orientalBookings = filteredBookings.filter(isOrientalBooking);
    const otherBookings = filteredBookings.filter(
      (b) => !isItalianBooking(b) && !isOrientalBooking(b),
    );

    const calculatePax = (items) =>
      items.reduce((sum, b) => sum + (parseInt(b.guests) || 0), 0);
    const totalPax = calculatePax(filteredBookings);

    const renderEmailTable = (items, title) => {
      const pax = calculatePax(items);
      return `
        <h3 style="color: #f97316; margin-top: 30px; border-bottom: 1px solid #eee;">${title} (Pax: ${pax})</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background: #f9fafb;">
              <th style="padding: 10px; border: 1px solid #eee; text-align: left;">Guest</th>
              <th style="padding: 10px; border: 1px solid #eee; text-align: left;">Room</th>
              <th style="padding: 10px; border: 1px solid #eee; text-align: center;">Pax</th>
              <th style="padding: 10px; border: 1px solid #eee; text-align: left;">Time</th>
              <th style="padding: 10px; border: 1px solid #eee; text-align: left;">Notes</th>
            </tr>
          </thead>
          <tbody>
            ${
              items.length === 0
                ? `<tr><td colspan="5" style="text-align: center; padding: 15px; color: #888; border: 1px solid #eee; font-style: italic;">No bookings</td></tr>`
                : items
                    .map(
                      (b) => `
              <tr>
                <td style="padding: 10px; border: 1px solid #eee;">${b.name}</td>
                <td style="padding: 10px; border: 1px solid #eee;">${b.room}</td>
                <td style="padding: 10px; border: 1px solid #eee; text-align: center;">${b.guests}</td>
                <td style="padding: 10px; border: 1px solid #eee;">${b.time}</td>
                <td style="padding: 10px; border: 1px solid #eee; font-size: 12px;">${b.notes || "-"}</td>
              </tr>
            `,
                    )
                    .join("")
            }
          </tbody>
        </table>
      `;
    };

    try {
      const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
      if (!GOOGLE_SCRIPT_URL) {
        showToast(
          t.dir === "rtl"
            ? "يرجى إضافة رابط Google Apps Script في الإعدادات"
            : "Please add Google Apps Script URL in .env",
        );
        return;
      }

      const payload = {
        command: "sendReport",
        targetEmail: settings.reportEmail,
        date: dateRangeLabel,
        totalPax: totalPax,
        bookings: filteredBookings.map((b) => ({
          time: b.time,
          name: b.name,
          phone: b.phone,
          room: b.room,
          guests: b.guests,
          restaurant: b.restaurant,
          resId: b.resId || "",
          notes: b.notes || "",
        })),
      };

      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload),
      });

      showToast(t.reportSent);
    } catch (e) {
      console.error(e);
      showToast(t.error);
    }
  }, [filteredBookings, dateRangeLabel, settings.reportEmail, t]);

  const exportToExcel = useCallback(() => {
    const reportT = translations.en;
    const headers = [
      "ID",
      reportT.date,
      reportT.time,
      reportT.fullName,
      reportT.room,
      reportT.restaurantType,
      reportT.bookingGuests,
      reportT.status,
      reportT.orderSummary,
      reportT.notesLabel || "Notes",
    ];
    const rows = filteredBookings.map((b) => {
      const engOrder =
        b.items && b.items.length > 0
          ? b.items
              .map((i) => {
                const m = MENU_ITEMS.find((item) => item.id === i.id);
                const itemName = m
                  ? m.name?.en || m.name?.ar || m.name
                  : i.name || i.id;
                return `${i.qty}x ${itemName}`;
              })
              .join(" | ")
          : b.orderDetails
            ? b.orderDetails.replace(/\n/g, " | ").replace(/"/g, "'")
            : "";

      return [
        b.id,
        b.date,
        b.time,
        `"${b.name}"`,
        `"${b.room}"`,
        b.resId === "italian" ? "Italian" : "Oriental",
        b.guests,
        b.status === "pending"
          ? "Pending"
          : b.status === "confirmed"
            ? "Confirmed"
            : b.status === "waitlist"
              ? "Waitlist"
              : b.status === "cancelled"
                ? "Cancelled"
                : "Completed",
        `"${engOrder}"`,
        `"${b.notes || ""}"`,
      ];
    });

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([`\\ufeff${csvContent}`], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `bookings_${dateRangeLabel}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredBookings, t, dateRangeLabel, MENU_ITEMS]);

  if (!isAdminAuth) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4 animate-fade-in">
        <AdminLogin
          adminUser={adminUser}
          setAdminUser={setAdminUser}
          adminPass={adminPass}
          setAdminPass={setAdminPass}
          onLogin={handleAdminLogin}
          t={t}
        />
      </div>
    );
  }

  const OrderEditorModal = ({ booking, onClose }) => {
    const [localCart, setLocalCart] = useState(
      booking.items || booking.cart || [],
    );
    const [deletedItems, setDeletedItems] = useState([]);
    const [localBooking, setLocalBooking] = useState({
      name: booking.name,
      room: booking.room,
      guests: booking.guests,
      date: booking.date,
      time: booking.time,
      restaurant: booking.restaurant,
      resId: booking.resId,
      status: booking.status,
      notes: booking.notes || "",
    });
    const [itemSearch, setItemSearch] = useState("");
    const [showItemAdder, setShowItemAdder] = useState(false);

    const handleRemoveItem = (index) => {
      const item = localCart[index];
      setDeletedItems([...deletedItems, item]);
      setLocalCart(localCart.filter((_, i) => i !== index));
    };

    const handleAddItem = (item) => {
      const currentTotal = localCart.reduce((sum, i) => sum + i.qty, 0);
      const pax = parseInt(localBooking.guests) || 0;

      if (currentTotal >= pax) {
        showToast(t.paxLimitReached || "Pax limit reached");
        return;
      }

      const existing = localCart.find((i) => i.id === item.id);
      if (existing) {
        setLocalCart(
          localCart.map((i) =>
            i.id === item.id ? { ...i, qty: i.qty + 1 } : i,
          ),
        );
      } else {
        setLocalCart([...localCart, { ...item, qty: 1 }]);
      }
      setItemSearch("");
    };

    const handleSave = async () => {
      try {
        const currentTotal = localCart.reduce((sum, i) => sum + i.qty, 0);
        const pax = parseInt(localBooking.guests) || 0;

        // Ensure items don't exceed pax if there are items
        if (localCart.length > 0 && currentTotal > pax) {
          showToast(t.paxLimitReached || "Total items exceed pax count");
          return;
        }

        const orderSummary = localCart
          .map(
            (i) =>
              `${i.qty}x ${typeof i.name === "string" ? i.name : i.name[lang] || i.name["en"]}`,
          )
          .join(", ");
        await updateDoc(doc(db, "bookings", booking.id.toString()), {
          ...localBooking,
          items: localCart,
          orderDetails:
            orderSummary ||
            (lang === "ar" ? "لا يوجد طلب طعام" : "No food order"),
          updatedBy: currentUser.name,
          updatedAt: serverTimestamp(),
        });
        showToast(t.success);
        onClose();
      } catch (e) {
        console.error(e);
        showToast(t.error);
      }
    };

    const filteredMenuItems = MENU_ITEMS.filter((item) => {
      const resMatch = localBooking.resId
        ? item.restaurant === localBooking.resId
        : true;
      const searchMatch =
        itemSearch === "" ||
        (typeof item.name === "string"
          ? item.name
          : item.name[lang] || item.name["en"]
        )
          .toLowerCase()
          .includes(itemSearch.toLowerCase());
      return resMatch && searchMatch;
    });

    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        ></div>
        <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
          <div className="p-8 bg-stone-50 border-b border-stone-100 flex justify-between items-center shrink-0">
            <div>
              <h3 className="text-2xl font-serif text-brand-blue">
                {t.editOrderDetails}
              </h3>
              <p className="text-stone-400 font-bold text-xs uppercase tracking-widest mt-1">
                {t.updateBookingData}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-stone-200 rounded-full transition-all text-stone-400"
            >
              <XCircle size={24} />
            </button>
          </div>

          <div className="p-8 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
            {/* Status Selector */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-orange px-1">
                {t.status}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  "pending",
                  "confirmed",
                  "waitlist",
                  "completed",
                  "cancelled",
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() =>
                      setLocalBooking({ ...localBooking, status: s })
                    }
                    className={`px-4 py-3 rounded-xl text-xs font-black transition-all border ${
                      localBooking.status === s
                        ? "bg-brand-blue text-white border-brand-blue shadow-md"
                        : "bg-white text-stone-400 border-stone-100 hover:border-stone-200"
                    }`}
                  >
                    {s === "pending"
                      ? t.statusPending
                      : s === "confirmed"
                        ? t.statusConfirmed
                        : s === "waitlist"
                          ? t.statusWaitlist
                          : s === "completed"
                            ? t.statusCompleted
                            : t.statusCancelled}
                  </button>
                ))}
              </div>
            </div>

            {/* Core Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 px-1">
                  {t.name}
                </label>
                <input
                  type="text"
                  value={localBooking.name}
                  onChange={(e) =>
                    setLocalBooking({ ...localBooking, name: e.target.value })
                  }
                  className="w-full bg-stone-50 border border-stone-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-brand-orange font-bold text-brand-blue"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 px-1">
                  {t.room}
                </label>
                <input
                  type="text"
                  value={localBooking.room}
                  onChange={(e) =>
                    setLocalBooking({ ...localBooking, room: e.target.value })
                  }
                  className="w-full bg-stone-50 border border-stone-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-brand-orange font-bold text-brand-blue"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 px-1">
                  {t.guests}
                </label>
                <input
                  type="number"
                  value={localBooking.guests}
                  onChange={(e) =>
                    setLocalBooking({ ...localBooking, guests: e.target.value })
                  }
                  className="w-full bg-stone-50 border border-stone-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-brand-orange font-bold text-brand-blue"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 px-1">
                  {t.time}
                </label>
                <input
                  type="text"
                  value={localBooking.time}
                  onChange={(e) =>
                    setLocalBooking({ ...localBooking, time: e.target.value })
                  }
                  className="w-full bg-stone-50 border border-stone-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-brand-orange font-bold text-brand-blue"
                />
              </div>
            </div>

            {/* Additional Comments */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 px-1">
                {t.comments}
              </label>
              <textarea
                value={localBooking.notes}
                onChange={(e) =>
                  setLocalBooking({ ...localBooking, notes: e.target.value })
                }
                rows={3}
                className="w-full bg-stone-50 border border-stone-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-brand-orange font-bold text-brand-blue resize-none custom-scrollbar text-sm"
                placeholder={t.comments}
              />
            </div>

            {/* Food Items Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                <h4 className="text-sm font-black uppercase tracking-[0.2em] text-brand-orange">
                  {t.foodItems}
                  <span className="ms-2 text-[10px] text-stone-400">
                    ({localCart.reduce((sum, i) => sum + i.qty, 0)} /{" "}
                    {localBooking.guests} PAX)
                  </span>
                </h4>
                <button
                  onClick={() => setShowItemAdder(!showItemAdder)}
                  className="flex items-center gap-1 text-xs font-black text-brand-blue hover:text-brand-orange transition-all"
                >
                  {showItemAdder ? <XCircle size={14} /> : <Plus size={14} />}
                  {t.addDish}
                </button>
              </div>

              {showItemAdder && (
                <div className="bg-stone-50 p-4 rounded-3xl border border-stone-100 space-y-4 animate-fade-in">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t.searchDish || "Search dish..."}
                      value={itemSearch}
                      onChange={(e) => setItemSearch(e.target.value)}
                      className="w-full p-3 ps-10 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-brand-blue text-sm font-bold"
                    />
                    <Search
                      size={16}
                      className="absolute top-1/2 -translate-y-1/2 left-3 text-stone-400"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 custom-scrollbar">
                    {filteredMenuItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleAddItem(item)}
                        className="flex items-center gap-3 p-2 bg-white rounded-xl border border-stone-100 hover:border-brand-blue transition-all text-start group"
                      >
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                          <img
                            src={item.img}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black text-brand-blue truncate">
                            {typeof item.name === "string"
                              ? item.name
                              : item.name[lang] || item.name["en"]}
                          </p>
                          <p className="text-[8px] text-stone-400 font-bold uppercase">
                            {item.category}
                          </p>
                        </div>
                        <Plus
                          size={14}
                          className="text-stone-300 group-hover:text-brand-blue"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {localCart.length === 0 ? (
                <div className="text-center py-8 text-stone-400 font-bold bg-stone-50 rounded-3xl border border-dashed border-stone-200">
                  {t.noItemsInOrder}
                </div>
              ) : (
                <div className="space-y-3">
                  {localCart.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-white rounded-2xl border border-stone-100 hover:border-brand-orange/30 transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-brand-orange/10 rounded-xl flex items-center justify-center font-black text-brand-orange text-sm">
                          {item.qty}x
                        </div>
                        <div>
                          <p className="font-bold text-brand-blue text-sm">
                            {typeof item.name === "string"
                              ? item.name
                              : item.name[lang] || item.name["en"]}
                          </p>
                          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                            {item.category}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const newCart = [...localCart];
                            if (newCart[idx].qty > 1) {
                              newCart[idx].qty -= 1;
                              setLocalCart(newCart);
                            } else {
                              handleRemoveItem(idx);
                            }
                          }}
                          className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Show Deleted Items for reference (To be replaced) */}
              {deletedItems.length > 0 && (
                <div className="space-y-3 opacity-50 grayscale mt-6">
                  <p className="text-[10px] font-black uppercase text-stone-400 px-1">
                    {t.deletedItemsForReplacement}
                  </p>
                  {deletedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100 line-through"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-stone-400">
                          {item.qty}x
                        </span>
                        <p className="text-xs font-bold text-stone-400">
                          {typeof item.name === "string"
                            ? item.name
                            : item.name[lang] || item.name["en"]}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setLocalCart([...localCart, item]);
                          setDeletedItems(
                            deletedItems.filter((_, i) => i !== idx),
                          );
                        }}
                        className="text-[10px] font-bold text-brand-blue hover:underline"
                      >
                        {t.undo}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-8 bg-white border-t border-stone-100 flex gap-4 shrink-0">
            <button
              onClick={onClose}
              className="flex-1 px-8 py-4 rounded-2xl font-black text-stone-400 hover:bg-stone-50 transition-all"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-brand-orange text-white px-8 py-4 rounded-2xl font-black hover:bg-brand-orangeHover transition-all shadow-lg"
            >
              {t.saveSettings || "Save"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-16 px-4 animate-fade-in">
      {editingBooking && (
        <OrderEditorModal
          booking={editingBooking}
          onClose={() => setEditingBooking(null)}
        />
      )}
      <div className="space-y-8">
        {/* Professional Welcome Header */}
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-stone-100 relative overflow-hidden mb-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-start">
              <p className="text-brand-orange font-black text-xs uppercase tracking-[0.3em] mb-2">
                {t.dashboard}
              </p>
              <h2 className="text-3xl md:text-5xl font-serif text-brand-blue flex flex-col md:flex-row md:items-center gap-4">
                <span>Welcome back,</span>
                <span className="text-brand-orange font-bold px-4 py-2 bg-brand-orange/10 rounded-2xl flex items-center gap-3">
                  {currentUser?.name || adminUser}
                </span>
              </h2>
              <p className="text-stone-400 mt-2 font-bold flex items-center gap-2 justify-center md:justify-start">
                <Users size={16} />
                {isSuperAdmin
                  ? lang === "ar"
                    ? "أدمن"
                    : "Admin"
                  : adminRole === "main"
                    ? t.mainAdminRole
                    : t.staffRole}
              </p>
            </div>
            <button
              onClick={() => {
                setIsAdminAuth(false);
                setAdminPass("");
                setAdminRole(null);
                setCurrentUser(null);
                localStorage.removeItem("morenoAdminAuth");
                localStorage.removeItem("morenoAdminRole");
                localStorage.removeItem("morenoCurrentUser");
              }}
              className="px-8 py-3 bg-red-50 text-red-500 rounded-2xl font-black text-sm hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100 flex items-center gap-2"
            >
              <XCircle size={18} />
              {t.logout}
            </button>
          </div>
        </div>

        {/* Date Filter & Bulk Print */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-lg border border-stone-100 flex flex-col xl:flex-row gap-6 items-center justify-between">
          <div className="flex flex-col lg:flex-row items-center gap-4 w-full xl:w-auto">
            <label className="font-bold text-stone-500 whitespace-nowrap">
              {t.selectDate}:
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setAdminStartDate(todayStr);
                  setAdminEndDate(todayStr);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  adminStartDate === todayStr && adminEndDate === todayStr
                    ? "bg-brand-blue text-white shadow-md"
                    : "bg-stone-50 text-stone-500"
                }`}
              >
                {t.today}
              </button>
              <button
                onClick={() => {
                  setAdminStartDate(yesterdayStr);
                  setAdminEndDate(yesterdayStr);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  adminStartDate === yesterdayStr && adminEndDate === yesterdayStr
                    ? "bg-brand-blue text-white shadow-md"
                    : "bg-stone-50 text-stone-500"
                }`}
              >
                {t.yesterday}
              </button>
              <button
                onClick={() => {
                  setAdminStartDate("");
                  setAdminEndDate("");
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  !adminStartDate && !adminEndDate
                    ? "bg-brand-blue text-white shadow-md"
                    : "bg-stone-50 text-stone-500"
                }`}
              >
                {t.showAll}
              </button>
            </div>
            <div className="flex items-center gap-2 w-full lg:w-auto">
              <div className="flex flex-col w-full lg:w-auto">
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1 px-1">
                  {t.startDate}
                </span>
                <input
                  type="date"
                  value={adminStartDate}
                  onChange={(e) => setAdminStartDate(e.target.value)}
                  className="w-full lg:w-auto bg-stone-50 p-3 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-brand-blue font-bold text-stone-700 text-sm"
                />
              </div>
              <span className="text-stone-400 font-bold mt-4 shrink-0 px-1">→</span>
              <div className="flex flex-col w-full lg:w-auto">
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1 px-1">
                  {t.endDate}
                </span>
                <input
                  type="date"
                  value={adminEndDate}
                  onChange={(e) => setAdminEndDate(e.target.value)}
                  className="w-full lg:w-auto bg-stone-50 p-3 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-brand-blue font-bold text-stone-700 text-sm"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={sendEmailReport}
              className="w-full md:w-auto bg-brand-blue text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-brand-blueHover transition-all shadow-md"
            >
              <Mail size={20} />
              {t.sendReport}
            </button>
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <button
                onClick={() => printDailyReport()}
                className="w-full bg-brand-orange text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-brand-orangeHover transition-all shadow-md"
              >
                <Printer size={18} />
                {t.printAll}
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => printDailyReport("italian")}
                  className="flex-1 bg-stone-800 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-stone-700 transition-all shadow-sm"
                >
                  <Utensils size={14} />
                  {t.italian}
                </button>
                <button
                  onClick={() => printDailyReport("oriental")}
                  className="flex-1 bg-brand-blue text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-brand-blueHover transition-all shadow-sm"
                >
                  <Utensils size={14} />
                  {t.oriental}
                </button>
              </div>
            </div>
            <button
              onClick={exportToExcel}
              className="w-full md:w-auto bg-green-600 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-green-700 transition-all shadow-md"
            >
              <QrCode size={20} />
              {t.exportExcel}
            </button>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-stone-100">
          <div className="p-6 border-b border-stone-100 bg-stone-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="text-xl font-bold text-brand-blue">
              {t.bookingsLog}
            </h3>
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder={t.searchNamePhone}
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                className={`w-full bg-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue border border-stone-200 text-sm font-bold ${t.dir === "rtl" ? "pr-10" : "pl-10"}`}
              />
              <Search
                size={18}
                className="absolute top-1/2 -translate-y-1/2 text-stone-400"
                style={{ [t.dir === "rtl" ? "right" : "left"]: "1rem" }}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-start">
              <thead className="bg-stone-50 text-stone-500 border-b border-stone-100">
                <tr>
                  <th className="p-6 font-bold whitespace-nowrap">
                    <span className="no-print">{t.bookingName}</span>
                    <span className="hidden print:inline">
                      Guest Name / Room
                    </span>
                  </th>
                  <th className="p-6 font-bold whitespace-nowrap">
                    <span className="no-print">{t.bookingDateTime}</span>
                    <span className="hidden print:inline">Date & Time</span>
                  </th>
                  <th className="p-6 font-bold whitespace-nowrap text-center">
                    <span className="no-print">{t.bookingGuests}</span>
                    <span className="hidden print:inline">Guests</span>
                  </th>
                  <th className="p-6 font-bold whitespace-nowrap text-center">
                    <span className="no-print">{t.status}</span>
                    <span className="hidden print:inline">Status</span>
                  </th>
                  <th className="p-6 font-bold whitespace-nowrap no-print">
                    {t.actions}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-12 text-center text-stone-400 font-bold text-lg"
                    >
                      {t.noBookings}
                    </td>
                  </tr>
                )}
                {filteredBookings.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors"
                  >
                    <td className="p-6">
                      <p className="font-black text-brand-blue text-lg">
                        {b.name}
                      </p>
                      <p className="text-sm text-stone-500 font-bold" dir="ltr">
                        {b.phone}
                      </p>
                      <span className="bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap">
                        {t.roomNumber} {b.room}
                      </span>
                      {b.updatedBy && (
                        <span className="bg-blue-50 text-blue-500 px-2 py-0.5 rounded text-[10px] font-bold">
                          {t.addedBy} {b.updatedBy}
                        </span>
                      )}
                    </td>
                    <td className="p-6 font-bold text-stone-600">
                      <span className="text-brand-blue block text-sm mb-1">
                        {b.restaurant}
                      </span>
                      {b.date} <br />{" "}
                      <span className="text-brand-orange">{b.time}</span>
                    </td>
                    <td className="p-6 font-black text-xl text-stone-700 text-center">
                      {b.guests}
                    </td>
                    <td className="p-6">
                      <span
                        className={`px-4 py-2 rounded-full text-xs font-black inline-block ${
                          b.status === "pending"
                            ? "bg-orange-100 text-orange-600"
                            : b.status === "confirmed"
                              ? "bg-green-100 text-green-600"
                              : b.status === "waitlist"
                                ? "bg-yellow-100 text-yellow-700"
                                : b.status === "cancelled"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-stone-200 text-stone-600"
                        }`}
                      >
                        <span className="no-print">
                          {b.status === "pending"
                            ? t.pendingBookings
                            : b.status === "confirmed"
                              ? t.confirmedBookings
                              : b.status === "waitlist"
                                ? t.statusWaitlist
                                : b.status === "cancelled"
                                  ? t.statusCancelled
                                  : t.finished}
                        </span>
                        <span className="hidden print:inline">
                          {b.status === "pending"
                            ? "Pending"
                            : b.status === "confirmed"
                              ? "Confirmed"
                              : b.status === "waitlist"
                                ? "Waitlist"
                                : b.status === "cancelled"
                                  ? "Cancelled"
                                  : "Completed"}
                        </span>
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex gap-2">
                        {b.status === "pending" && (
                          <>
                            <button
                              onClick={async () =>
                                await updateDoc(
                                  doc(db, "bookings", b.id.toString()),
                                  {
                                    status: "confirmed",
                                    updatedBy: currentUser.name,
                                    updatedAt: serverTimestamp(),
                                  },
                                )
                              }
                              className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 font-bold shadow-sm transition-all text-sm flex items-center gap-1"
                            >
                              <CheckCircle size={16} /> {t.confirm}
                            </button>
                            <button
                              onClick={async () =>
                                await updateDoc(
                                  doc(db, "bookings", b.id.toString()),
                                  {
                                    status: "cancelled",
                                    updatedBy: currentUser.name,
                                    updatedAt: serverTimestamp(),
                                  },
                                )
                              }
                              className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 font-bold shadow-sm transition-all text-sm flex items-center gap-1"
                            >
                              <XCircle size={16} /> {t.cancel}
                            </button>
                          </>
                        )}
                        {b.status === "confirmed" && (
                          <button
                            onClick={async () =>
                              await updateDoc(
                                doc(db, "bookings", b.id.toString()),
                                {
                                  status: "completed",
                                  updatedBy: currentUser.name,
                                  updatedAt: serverTimestamp(),
                                },
                              )
                            }
                            className="bg-brand-blue text-white px-4 py-2 rounded-xl hover:bg-brand-blueHover font-bold shadow-sm transition-all text-sm flex items-center gap-1"
                          >
                            <Check size={16} /> {t.complete}
                          </button>
                        )}
                        {b.status === "waitlist" && (
                          <button
                            onClick={async () =>
                              await updateDoc(
                                doc(db, "bookings", b.id.toString()),
                                {
                                  status: "confirmed",
                                  updatedBy: currentUser.name,
                                  updatedAt: serverTimestamp(),
                                },
                              )
                            }
                            className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 font-bold shadow-sm transition-all text-sm flex items-center gap-1"
                          >
                            <CheckCircle size={16} /> {t.confirm}
                          </button>
                        )}
                        <button
                          onClick={() => printReceipt(b)}
                          className="bg-brand-blue/10 text-brand-blue px-3 py-2 rounded-xl hover:bg-brand-blue/20 font-bold shadow-sm transition-all text-sm flex items-center gap-1"
                        >
                          <Printer size={16} />
                        </button>

                        {/* Edit Button for Manager/Admin */}
                        {(isSuperAdmin || adminRole === "main") && (
                          <button
                            onClick={() => setEditingBooking(b)}
                            className="bg-brand-orange/10 text-brand-orange px-3 py-2 rounded-xl hover:bg-brand-orange/20 font-bold shadow-sm transition-all text-sm flex items-center gap-1"
                          >
                            <Edit size={16} />
                          </button>
                        )}

                        <button
                          onClick={async () =>
                            await deleteDoc(
                              doc(db, "bookings", b.id.toString()),
                            )
                          }
                          className="text-stone-300 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-colors ml-auto"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-stone-100 flex flex-col items-center text-center relative overflow-hidden group hover:shadow-xl transition-all">
            <div className="absolute top-0 w-full h-1.5 bg-blue-500"></div>
            <p className="text-stone-400 font-bold text-xs uppercase tracking-wider mb-2 mt-2">
              {t.italianAvail}
            </p>
            <p className="text-5xl font-black text-blue-600 my-auto">
              {italianTodayAvail}
            </p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-stone-100 flex flex-col items-center text-center relative overflow-hidden group hover:shadow-xl transition-all">
            <div className="absolute top-0 w-full h-1.5 bg-orange-500"></div>
            <p className="text-stone-400 font-bold text-xs uppercase tracking-wider mb-2 mt-2">
              {t.orientalAvail}
            </p>
            <p className="text-5xl font-black text-orange-600 my-auto">
              {orientalTodayAvail}
            </p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-stone-100 flex flex-col items-center text-center relative overflow-hidden group hover:shadow-xl transition-all">
            <div className="absolute top-0 w-full h-1.5 bg-green-500"></div>
            <p className="text-stone-400 font-bold text-xs uppercase tracking-wider mb-2 mt-2">
              {t.availableTables}
            </p>
            <p className="text-5xl font-black text-green-600 my-auto">
              {italianTodayAvail + orientalTodayAvail}
            </p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-stone-100 flex flex-col items-center text-center relative overflow-hidden group hover:shadow-xl transition-all">
            <div className="absolute top-0 w-full h-1.5 bg-brand-orange"></div>
            <p className="text-stone-400 font-bold text-xs uppercase tracking-wider mb-2 mt-2">
              {t.pendingBookings}
            </p>
            <p className="text-5xl font-black text-brand-orange my-auto">
              {bookings.filter((b) => b.status === "pending").length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-stone-100 flex flex-col items-center text-center relative overflow-hidden group hover:shadow-xl transition-all">
            <div className="absolute top-0 w-full h-1.5 bg-red-500"></div>
            <p className="text-stone-400 font-bold text-xs uppercase tracking-wider mb-2 mt-2">
              {t.totalPax} ({t.today})
            </p>
            <p className="text-5xl font-black text-red-600 my-auto">
              {bookings
                .filter((b) => b.date === todayStr && b.status !== "cancelled")
                .reduce((sum, b) => sum + Number(b.guests || 0), 0)}
            </p>
          </div>
        </div>

        {/* Administrative Panels */}
        {(isSuperAdmin || adminRole === "main") && (
          <div className="space-y-8 animate-fade-in mt-12">
            <SettingsPanel
              settings={settings}
              t={t}
              onSave={updateSettingsInDB}
              isSuperAdmin={isSuperAdmin}
              lang={lang}
            />
            <BestSellersChart bookings={bookings} t={t} lang={lang} />

            {/* User Management for Super Admin ONLY */}
            {isSuperAdmin && (
              <UsersPanel users={users} t={t} db={db} showToast={showToast} />
            )}

            {isSuperAdmin && (
              <CustomerDatabasePanel bookings={bookings} t={t} />
            )}
            <BlacklistPanel
              blacklist={blacklist}
              t={t}
              db={db}
              showToast={showToast}
            />
          </div>
        )}

        {/* Weekly Trend Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-100 animate-fade-in mt-12">
          <h3 className="text-xl font-bold text-brand-blue mb-8 flex items-center gap-3">
            <BarChart size={24} className="text-purple-500" />
            {t.weeklyTrend}
          </h3>
          <div className="flex items-end justify-between gap-2 h-48 px-2">
            {weeklyData.map((d, i) => (
              <div
                key={d.date}
                className="flex-1 flex flex-col items-center group"
              >
                <div
                  className={`w-full rounded-t-xl transition-all duration-500 relative ${i === 6 ? "bg-brand-orange" : "bg-stone-200 group-hover:bg-stone-300"}`}
                  style={{
                    height: `${(d.count / maxWeeklyCount) * 100}%`,
                    minHeight: "8px",
                  }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                    {d.count}
                  </div>
                </div>
                <p className="text-[10px] text-stone-400 font-bold mt-4 uppercase rotate-[-45deg] md:rotate-0">
                  {i === 6 ? t.today : d.date.split("-").slice(1).join("/")}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* QR Code Section */}
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-stone-100 flex flex-col items-center text-center mt-12 animate-fade-in">
          <h3 className="text-2xl font-bold text-brand-blue mb-6">
            {t.qrTitle}
          </h3>
          <div className="bg-stone-50 p-6 rounded-3xl shadow-inner border border-stone-200">
            <QRCodeSVG
              value="https://morenohorizon.netlify.app"
              size={200}
              fgColor="#1e293b"
            />
          </div>
          <p className="text-stone-500 font-bold mt-6">
            {t.printQrInstruction}
          </p>
        </div>
      </div>
    </div>
  );
}

const MemoizedAdminView = memo(AdminView);
MemoizedAdminView.displayName = "AdminView";

export default MemoizedAdminView;
