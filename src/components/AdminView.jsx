import { memo, useState, useEffect, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { translations } from "../translations";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  Search,
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
  Share2,
  Copy,
  Bell,
  ChefHat,
  Sparkles,
  Unlock,
  Phone,
  ArrowLeftRight,
  UserPlus,
  BellRing,
  Send,
} from "lucide-react";
import AdminLogin from "./AdminLogin";
import {
  SettingsPanel,
  UsersPanel,
  BlacklistPanel,
  CustomerDatabasePanel,
  AnalyticsDashboard,
  FeedbackPanel,
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

function AdminView({
  t,
  italianTodayAvail,
  orientalTodayAvail,
  bookings,
  todayStr,
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

    // Firebase Auth check
    try {
      const email = adminUser + "@moreno.local";
      const userCredential = await signInWithEmailAndPassword(auth, email, adminPass);
      const user = userCredential.user;
      
      const userQuery = query(
        collection(db, "users"),
        where("username", "==", adminUser)
      );
      const userSnap = await getDocs(userQuery);
      
      let role = "staff";
      let name = adminUser;
      
      if (!userSnap.empty) {
        const userData = userSnap.docs[0].data();
        role = userData.role || "staff";
        name = userData.name || adminUser;
      }
      
      const adminData = {
        name: name,
        username: adminUser,
        role: role,
      };
      
      setAdminRole(role);
      setCurrentUser(adminData);
      setIsAdminAuth(true);
      
      localStorage.setItem("morenoAdminAuth", "true");
      localStorage.setItem("morenoAdminRole", role);
      localStorage.setItem("morenoCurrentUser", JSON.stringify(adminData));
      
    } catch (e) {
      console.error("Login Error:", e);
      showToast(t.wrongPassword);
    }
  };

  // --- Admin Filter States ---
  const [adminSearch, setAdminSearch] = useState("");
  const [debouncedAdminSearch, setDebouncedAdminSearch] = useState("");
  const [adminStartDate, setAdminStartDate] = useState(todayStr);
  const [adminEndDate, setAdminEndDate] = useState(todayStr);
  const [visibleBookingsCount, setVisibleBookingsCount] = useState(10);

  useEffect(() => {
    setVisibleBookingsCount(10);
  }, [adminSearch, adminStartDate, adminEndDate]);

  const [editingBooking, setEditingBooking] = useState(null);
  const [shareBooking, setShareBooking] = useState(null);
  const [selectedMapRes, setSelectedMapRes] = useState("italian");
  const [selectedMapTime, setSelectedMapTime] = useState(settings?.shift1 || "18:30 - 19:30");

  useEffect(() => {
    if (settings && settings.shift1) {
      setSelectedMapTime(settings.shift1);
    } else {
      setSelectedMapTime("18:30 - 19:30");
    }
  }, [settings]);

  const [selectedMapTable, setSelectedMapTable] = useState(null);
  const [movingBooking, setMovingBooking] = useState(null);
  
  // Quick walk-in states
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInName, setWalkInName] = useState("");
  const [walkInRoom, setWalkInRoom] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");
  const [walkInGuests, setWalkInGuests] = useState("4");
  const [walkInNotes, setWalkInNotes] = useState("");
  const [notificationPermission, setNotificationPermission] = useState(
    () => typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default"
  );

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      showToast(lang === "ar" ? "الإشعارات غير مدعومة في هذا المتصفح" : "Notifications not supported in this browser");
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === "granted") {
        showToast(lang === "ar" ? "🔔 تم تفعيل الإشعارات بنجاح!" : "🔔 Notifications enabled successfully!");
        if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification(lang === "ar" ? "🔔 تم التفعيل بنجاح!" : "🔔 Activated Successfully!", {
              body: lang === "ar" ? "ستصلك إشعارات فورية بكل الحجز الجديدة!" : "You will receive instant alerts for every new reservation!",
              icon: "/logo.webp",
              badge: "/logo.webp",
            });
          });
        }
      } else {
        showToast(lang === "ar" ? "تم رفض الإذن لتفعيل الإشعارات" : "Notification permission denied");
      }
    } catch (err) {
      console.error(err);
    }
  };

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

      if (debouncedAdminSearch) return matchesSearch;

      let matchesDate = true;
      if (adminStartDate && adminEndDate) {
        matchesDate = b.date >= adminStartDate && b.date <= adminEndDate;
      } else if (adminStartDate) {
        matchesDate = b.date >= adminStartDate;
      } else if (adminEndDate) {
        matchesDate = b.date <= adminEndDate;
      }

      return matchesDate;
    });
  }, [bookings, debouncedAdminSearch, adminStartDate, adminEndDate]);

  const getOccupancy = useCallback(
    (date, restaurantId, time = null) => {
      return bookings
        .filter((b) => {
          const isSameDate = b.date === date;
          const isCancelled = b.status === "cancelled";
          const isSameRestaurant =
            b.resId === restaurantId ||
            (b.restaurant &&
              b.restaurant.toLowerCase().includes(restaurantId.toLowerCase()));
          const isSameTime = !time || b.time === time;
          return isSameDate && !isCancelled && isSameRestaurant && isSameTime;
        })
        .reduce((sum, b) => sum + Number(b.guests || 1), 0);
    },
    [bookings],
  );

  const waitlistBookings = useMemo(() => {
    return bookings.filter((b) => b.status === "waitlist");
  }, [bookings]);

  // --- Table Map Floor Layout Configurations ---
  const ITALIAN_TABLES = useMemo(() => {
    const count = settings.tablesCountItalian !== undefined && settings.tablesCountItalian !== "" ? Number(settings.tablesCountItalian) : 12;
    const list = [];
    
    const indoorCount = Math.ceil(count * 0.6);
    const vipCount = Math.ceil(count * 0.2);
    const outdoorCount = count - indoorCount - vipCount;

    // Helper to generate dynamic grid spacing:
    const layoutZone = (zoneCount, startX, width, startY, height, isIndoor = false) => {
      if (zoneCount <= 0) return [];
      
      let rows = 2;
      if (isIndoor) {
        if (zoneCount <= 6) rows = 2;
        else if (zoneCount <= 12) rows = 3;
        else if (zoneCount <= 20) rows = 4;
        else rows = 5;
      } else {
        if (zoneCount <= 3) rows = 2;
        else if (zoneCount <= 6) rows = 3;
        else if (zoneCount <= 10) rows = 4;
        else rows = 5;
      }

      const cols = Math.ceil(zoneCount / rows);
      const points = [];
      
      for (let idx = 0; idx < zoneCount; idx++) {
        const r = idx % rows;
        const c = Math.floor(idx / rows);
        
        const x = cols > 1 ? startX + c * (width / (cols - 1)) : startX + width / 2;
        const y = rows > 1 ? startY + r * (height / (rows - 1)) : startY + height / 2;
        points.push({ x, y });
      }
      return points;
    };

    const indoorPoints = layoutZone(indoorCount, 8, 40, 18, 64, true);
    const vipPoints = layoutZone(vipCount, 58, 12, 18, 64, false);
    const outdoorPoints = layoutZone(outdoorCount, 78, 14, 18, 64, false);

    for (let i = 1; i <= count; i++) {
      let zone = "indoor";
      let type = "round";
      let seats = 2;
      let x = 8;
      let y = 12;

      if (i <= indoorCount) {
        zone = "indoor";
        const pt = indoorPoints[i - 1];
        if (pt) {
          x = pt.x;
          y = pt.y;
        }
        
        if (i % 3 === 0) {
          type = "rectangle";
          seats = 6;
        } else if (i % 2 === 0) {
          type = "square";
          seats = 4;
        } else {
          type = "round";
          seats = 2;
        }
      } else if (i <= indoorCount + vipCount) {
        zone = "vip";
        const pt = vipPoints[i - indoorCount - 1];
        if (pt) {
          x = pt.x;
          y = pt.y;
        }
        type = "rectangle";
        seats = i % 2 === 0 ? 8 : 6;
      } else {
        zone = "outdoor";
        const pt = outdoorPoints[i - indoorCount - vipCount - 1];
        if (pt) {
          x = pt.x;
          y = pt.y;
        }
        type = i % 2 === 0 ? "square" : "round";
        seats = i % 2 === 0 ? 4 : 2;
      }

      list.push({ id: `T${i}`, name: i.toString(), type, seats, zone, x, y });
    }
    return list;
  }, [settings.tablesCountItalian]);

  const ORIENTAL_TABLES = useMemo(() => {
    const count = settings.tablesCountOriental !== undefined && settings.tablesCountOriental !== "" ? Number(settings.tablesCountOriental) : 8;
    const list = [];

    const indoorCount = Math.ceil(count * 0.6);
    const vipCount = Math.ceil(count * 0.2);
    const outdoorCount = count - indoorCount - vipCount;

    const layoutZone = (zoneCount, startX, width, startY, height, isIndoor = false) => {
      if (zoneCount <= 0) return [];
      
      let rows = 2;
      if (isIndoor) {
        if (zoneCount <= 6) rows = 2;
        else if (zoneCount <= 12) rows = 3;
        else if (zoneCount <= 20) rows = 4;
        else rows = 5;
      } else {
        if (zoneCount <= 3) rows = 2;
        else if (zoneCount <= 6) rows = 3;
        else if (zoneCount <= 10) rows = 4;
        else rows = 5;
      }

      const cols = Math.ceil(zoneCount / rows);
      const points = [];
      
      for (let idx = 0; idx < zoneCount; idx++) {
        const r = idx % rows;
        const c = Math.floor(idx / rows);
        
        const x = cols > 1 ? startX + c * (width / (cols - 1)) : startX + width / 2;
        const y = rows > 1 ? startY + r * (height / (rows - 1)) : startY + height / 2;
        points.push({ x, y });
      }
      return points;
    };

    const indoorPoints = layoutZone(indoorCount, 8, 40, 18, 64, true);
    const vipPoints = layoutZone(vipCount, 58, 12, 18, 64, false);
    const outdoorPoints = layoutZone(outdoorCount, 78, 14, 18, 64, false);

    for (let i = 1; i <= count; i++) {
      let zone = "indoor";
      let type = "round";
      let seats = 4;
      let x = 10;
      let y = 15;

      if (i <= indoorCount) {
        zone = "indoor";
        const pt = indoorPoints[i - 1];
        if (pt) {
          x = pt.x;
          y = pt.y;
        }

        if (i % 3 === 0) {
          type = "rectangle";
          seats = 6;
        } else if (i % 2 === 0) {
          type = "square";
          seats = 4;
        } else {
          type = "round";
          seats = 4;
        }
      } else if (i <= indoorCount + vipCount) {
        zone = "vip";
        const pt = vipPoints[i - indoorCount - 1];
        if (pt) {
          x = pt.x;
          y = pt.y;
        }
        type = "rectangle";
        seats = i % 2 === 0 ? 8 : 6;
      } else {
        zone = "outdoor";
        const pt = outdoorPoints[i - indoorCount - vipCount - 1];
        if (pt) {
          x = pt.x;
          y = pt.y;
        }
        type = "round";
        seats = 4;
      }

      list.push({ id: `O${i}`, name: (20 + i).toString(), type, seats, zone, x, y });
    }
    return list;
  }, [settings.tablesCountOriental]);

  const findAvailableTable = useCallback((date, restaurantId, time, guestsCount) => {
    const requestedGuests = Number(guestsCount || 1);
    const tablesList = restaurantId === "italian" ? ITALIAN_TABLES : ORIENTAL_TABLES;

    if (!tablesList || tablesList.length === 0) return "";

    const isItalianBooking = (b) => {
      const rId = (b.resId || "").toLowerCase();
      const rName = (b.restaurant || "").toLowerCase();
      return rId === "italian" || rName.includes("italian") || rName.includes("إيطالي") || rName.includes("ايطالي");
    };
    const isOrientalBooking = (b) => {
      const rId = (b.resId || "").toLowerCase();
      const rName = (b.restaurant || "").toLowerCase();
      return rId === "oriental" || rName.includes("oriental") || rName.includes("شرقي") || rName.includes("عربي");
    };

    // Filter active bookings for same date and shift/restaurant
    const activeTimeBookings = bookings.filter((b) => {
      const isActive = b.status === "confirmed" || b.status === "completed" || b.status === "pending";
      const isSameDate = b.date === date;
      const isSameRes = restaurantId === "italian" ? isItalianBooking(b) : isOrientalBooking(b);
      const isSameTime = restaurantId === "oriental" || b.time === time;
      return isActive && isSameDate && isSameRes && isSameTime;
    });

    const takenTableNames = new Set(
      activeTimeBookings.filter((b) => b.tableNo).map((b) => b.tableNo.toString())
    );

    // Available tables are those not taken
    const availableTables = tablesList.filter((table) => !takenTableNames.has(table.name));

    // Best matching table: smallest seats that is >= requestedGuests
    let qualifyingTables = availableTables.filter((table) => table.seats >= requestedGuests);

    // If no single table is large enough, look at any available table
    if (qualifyingTables.length === 0) {
      qualifyingTables = [...availableTables];
    }

    if (qualifyingTables.length === 0) return "";

    // Sort:
    // 1. smallest seats first
    // 2. smallest table number first
    qualifyingTables.sort((a, b) => {
      if (a.seats !== b.seats) {
        return a.seats - b.seats;
      }
      return Number(a.name) - Number(b.name);
    });

    return qualifyingTables[0].name;
  }, [bookings, ITALIAN_TABLES, ORIENTAL_TABLES]);

  const activeMapBookings = useMemo(() => {
    const targetDate = adminStartDate || todayStr;
    const isItalianBooking = (b) => {
      const rId = (b.resId || "").toLowerCase();
      const rName = (b.restaurant || "").toLowerCase();
      return rId === "italian" || rName.includes("italian") || rName.includes("إيطالي") || rName.includes("ايطالي");
    };
    const isOrientalBooking = (b) => {
      const rId = (b.resId || "").toLowerCase();
      const rName = (b.restaurant || "").toLowerCase();
      return rId === "oriental" || rName.includes("oriental") || rName.includes("شرقي") || rName.includes("عربي");
    };

    return bookings.filter((b) => {
      const isConfirmed = b.status === "confirmed" || b.status === "completed" || b.status === "pending";
      const isSameDate = b.date === targetDate;
      const isSameRes = selectedMapRes === "italian" ? isItalianBooking(b) : isOrientalBooking(b);
      const isSameTime = selectedMapRes === "oriental" || b.time === selectedMapTime;
      return isConfirmed && isSameDate && isSameRes && isSameTime;
    });
  }, [bookings, adminStartDate, todayStr, selectedMapRes, selectedMapTime]);

  const bookingsByTable = useMemo(() => {
    const map = {};
    activeMapBookings.forEach((b) => {
      if (b.tableNo) {
        map[b.tableNo.toString()] = b;
      }
    });
    return map;
  }, [activeMapBookings]);

  const unassignedBookings = useMemo(() => {
    return activeMapBookings.filter((b) => !b.tableNo);
  }, [activeMapBookings]);

  // --- Upcoming Reminders Memoized selectors ---
  const getBookingStartMs = useCallback((bookingDate, bookingTimeRange) => {
    if (!bookingDate || !bookingTimeRange) return null;
    const startPart = bookingTimeRange.split(" - ")[0].trim(); // e.g. "18:30"
    const [hour, minute] = startPart.split(":").map(Number);
    if (isNaN(hour) || isNaN(minute)) return null;
    const bDate = new Date(bookingDate);
    bDate.setHours(hour, minute, 0, 0);
    return bDate.getTime();
  }, []);

  const upcomingReminders = useMemo(() => {
    const now = Date.now();
    return bookings.filter((b) => {
      if (b.status !== "confirmed") return false;
      if (b.reminderSent) return false;
      if (b.date !== todayStr) return false;

      const startMs = getBookingStartMs(b.date, b.time);
      if (!startMs) return false;

      const diffMin = (startMs - now) / 60000;
      // Reminders are due if the booking starts in the next 120 minutes (2 hours) and has not started more than 15 minutes ago
      return diffMin > -15 && diffMin <= 120;
    });
  }, [bookings, todayStr, getBookingStartMs]);

  // --- Automated Alert Scanner ---
  useEffect(() => {
    if (upcomingReminders.length === 0) return;

    const warnedIds = JSON.parse(sessionStorage.getItem("notifiedReminderIds") || "[]");
    const newRemindersToWarn = upcomingReminders.filter((b) => !warnedIds.includes(b.id));
    if (newRemindersToWarn.length === 0) return;

    if (notificationPermission === "granted") {
      newRemindersToWarn.forEach((b) => {
        const startPart = b.time ? b.time.split(" - ")[0].trim() : "";
        new Notification(lang === "ar" ? "⏰ تذكير بموعد حجز!" : "⏰ Upcoming Reservation Alert!", {
          body: lang === "ar"
            ? `النزيل ${b.name} (غرفة ${b.room}) يبدأ حجزه الساعة ${startPart} ولم يتم تذكيره بعد.`
            : `Guest ${b.name} (Room ${b.room}) starts reservation at ${startPart} and hasn't been reminded.`,
          icon: "/logo.webp",
        });
        warnedIds.push(b.id);
      });
      sessionStorage.setItem("notifiedReminderIds", JSON.stringify(warnedIds));
    }
  }, [upcomingReminders, notificationPermission, lang]);

  // --- Functions ---
  const updateSettingsInDB = useCallback(
    async (newSettings) => {
      try {
        const sanitizedSettings = Object.fromEntries(
          Object.entries(newSettings).filter(([, v]) => v !== undefined),
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

  const assignTableToBooking = useCallback(async (bookingId, tableNo) => {
    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        tableNo: tableNo,
      });
      showToast(lang === "ar" ? "تم تسكين الضيف في الطاولة بنجاح! 🪑" : "Guest assigned to table successfully! 🪑");
    } catch (err) {
      console.error("Error assigning table:", err);
      showToast(lang === "ar" ? "فشل تحديد الطاولة" : "Failed to assign table");
    }
  }, [db, lang, showToast]);

  const unassignTable = useCallback(async (bookingId) => {
    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        tableNo: "",
      });
      showToast(lang === "ar" ? "تم تحرير الطاولة!" : "Table unassigned successfully!");
    } catch (err) {
      console.error("Error unassigning table:", err);
      showToast(lang === "ar" ? "فشل تحرير الطاولة" : "Failed to unassign table");
    }
  }, [db, lang, showToast]);

  const completeBookingFromMap = useCallback(async (bookingId) => {
    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: "completed",
        updatedAt: serverTimestamp(),
      });
      showToast(lang === "ar" ? "تم إنهاء الحجز وتحرير الطاولة بنجاح! ✅" : "Booking marked as completed and table freed! ✅");
    } catch (err) {
      console.error("Error completing booking:", err);
      showToast(lang === "ar" ? "فشل إنهاء الحجز" : "Failed to complete booking");
    }
  }, [db, lang, showToast]);

  const saveWalkInBooking = useCallback(async () => {
    if (!walkInName || !walkInGuests) {
      showToast(lang === "ar" ? "يرجى ملء الاسم وعدد الضيوف" : "Please fill Name and Guests count");
      return;
    }
    try {
      const newRef = doc(collection(db, "bookings"));
      await setDoc(newRef, {
        name: walkInName,
        phone: walkInPhone || "Walk-In",
        guests: Number(walkInGuests),
        room: walkInRoom || "Walk-In",
        restaurant: selectedMapRes === "italian" ? "La Mama (Italian)" : "Aseel (Oriental)",
        resId: selectedMapRes,
        date: adminStartDate || todayStr,
        time: selectedMapRes === "italian" ? selectedMapTime : "19:00 - 20:00",
        status: "confirmed",
        tableNo: selectedMapTable.name,
        notes: walkInNotes,
        createdAt: serverTimestamp(),
      });
      showToast(lang === "ar" ? "تم إضافة حجز مباشر وتسكينه بنجاح! ✨" : "Walk-in booking created and assigned successfully! ✨");
      setShowWalkInModal(false);
      // Reset walk-in form
      setWalkInName("");
      setWalkInRoom("");
      setWalkInPhone("");
      setWalkInGuests("4");
      setWalkInNotes("");
    } catch (err) {
      console.error("Error creating walk-in booking:", err);
      showToast(lang === "ar" ? "فشل حفظ الحجز المباشر" : "Failed to save walk-in booking");
    }
  }, [
    db,
    lang,
    showToast,
    walkInName,
    walkInPhone,
    walkInGuests,
    walkInRoom,
    selectedMapRes,
    adminStartDate,
    todayStr,
    selectedMapTime,
    selectedMapTable,
    walkInNotes,
  ]);

  const sendReminder = useCallback(async (booking) => {
    if (!booking.phone || booking.phone.toLowerCase() === "walk-in") {
      showToast(lang === "ar" ? "⚠️ لا يوجد رقم هاتف مسجل لهذا الحجز!" : "⚠️ No contact phone registered for this booking!");
      return;
    }
    try {
      const isItalian = booking.resId === "italian" || (booking.restaurant && (booking.restaurant.toLowerCase().includes("italian") || booking.restaurant.includes("إيطالي") || booking.restaurant.includes("ايطالي")));
      const resName = isItalian ? (lang === "ar" ? "La Mama (إيطالي)" : "La Mama (Italian)") : (lang === "ar" ? "Aseel (شرقي)" : "Aseel (Oriental)");
      const startPart = booking.time ? booking.time.split(" - ")[0].trim() : "";

      const msg = lang === "ar"
        ? `عزيزنا الضيف ${booking.name}، نود تذكيرك بموعد حجزك اليوم بمطعم ${resName} الفاخر الساعة ${startPart} 🌟\n\nنحن بانتظارك ونتطلع لتقديم تجربة طعام استثنائية تليق بك! 🥰\n\nمنتجع Moreno Horizon.`
        : `Dear guest ${booking.name}, we are delighted to remind you of your reservation today at the exquisite ${resName} restaurant at ${startPart} 🌟\n\nWe look forward to welcoming you for an exceptional dining experience! 🥰\n\nMoreno Horizon Resort.`;

      const cleanPhone = booking.phone.replace(/[+\s-]/g, "");
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
      window.open(whatsappUrl, "_blank");

      // Register reminder sent in DB
      await updateDoc(doc(db, "bookings", booking.id), {
        reminderSent: true,
        reminderSentAt: serverTimestamp(),
      });

      showToast(lang === "ar" ? "🔔 تم تسجيل تذكير النزيل وإرسال الرسالة!" : "🔔 Reminder sent and registered successfully!");
    } catch (err) {
      console.error("Error sending reminder:", err);
      showToast(lang === "ar" ? "فشل تحديث حالة التذكير" : "Failed to update reminder status");
    }
  }, [db, lang, showToast]);

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

  const printKitchenTicket = useCallback(
    (booking) => {
      let cleanOrderDetails = lang === "ar" ? "لا توجد طلبات طعام" : "No food orders";
      if (booking.items && booking.items.length > 0) {
        cleanOrderDetails = booking.items
          .map((item) => `- <b>${item.qty}x</b> ${item.name[lang] || item.name["en"]}`)
          .join("<br/>");
      } else if (booking.orderDetails) {
        cleanOrderDetails = booking.orderDetails.replace(/\n/g, "<br/>");
      }

      const isItalian =
        booking.resId === "italian" ||
        (booking.restaurant &&
          (booking.restaurant.includes("Italian") ||
            booking.restaurant.includes("إيطالي")));
      const resNamePrint = isItalian ? "ITALIAN KITCHEN / المطبخ الإيطالي" : "ORIENTAL KITCHEN / المطبخ الشرقي";

      const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>KITCHEN TICKET #MH-${booking.id.toString().slice(-4)}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
                    body {
                        font-family: 'Cairo', sans-serif;
                        margin: 0;
                        padding: 10px;
                        display: flex;
                        justify-content: center;
                        background: #fff;
                        color: #000;
                    }
                    .ticket { 
                        width: 100%; 
                        max-width: 280px; 
                        border: 1px dashed #000; 
                        padding: 12px;
                        box-sizing: border-box;
                    }
                    .header { text-align: center; margin-bottom: 8px; }
                    .header h1 { margin: 0; font-size: 18px; font-weight: 900; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 3px; }
                    .header p { margin: 3px 0 0; font-size: 10px; font-weight: bold; }
                    .divider { border-top: 1px dashed #000; margin: 8px 0; }
                    .info-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 12px; }
                    .info-row strong { font-weight: 900; font-size: 14px; }
                    .kitchen-dest { 
                        text-align: center; 
                        font-weight: 900; 
                        background: #000; 
                        color: #fff; 
                        padding: 5px; 
                        font-size: 11px; 
                        margin: 6px 0;
                        border-radius: 4px;
                    }
                    .order-title { font-weight: bold; font-size: 11px; text-decoration: underline; margin-bottom: 4px; }
                    .order-details { 
                        font-size: 13px; 
                        white-space: pre-wrap; 
                        padding: 3px; 
                        line-height: 1.5;
                        font-weight: bold;
                    }
                    .notes-box {
                        margin-top: 8px;
                        padding: 5px;
                        border: 1px dashed #000;
                        font-size: 11px;
                        font-weight: bold;
                    }
                    .footer { text-align: center; margin-top: 12px; font-size: 9px; border-top: 1px solid #000; padding-top: 4px; }
                    @page { size: auto; margin: 0mm; }
                </style>
            </head>
            <body>
                <div class="ticket">
                    <div class="header">
                        <h1>شيت المطبخ</h1>
                        <p>KITCHEN ORDER TICKET</p>
                        <p style="font-size: 13px; font-weight: 900;">#MH-${booking.id.toString().slice(-4)}</p>
                    </div>
                    
                    <div class="kitchen-dest">${resNamePrint}</div>
                    
                    <div class="divider"></div>
                    
                    <div class="info-row">
                      <span>Room / رقم الغرفة:</span>
                      <strong>${booking.room}</strong>
                    </div>
                    <div class="info-row">
                      <span>Pax / الأفراد:</span>
                      <strong>${booking.guests}</strong>
                    </div>
                    <div class="info-row">
                      <span>Time / الوقت:</span>
                      <strong>${booking.time}</strong>
                    </div>
                    <div class="info-row">
                      <span>Date / التاريخ:</span>
                      <strong>${booking.date}</strong>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <div class="order-title">Food Items / الطلبات:</div>
                    <div class="order-details">${cleanOrderDetails}</div>
                    
                    ${booking.notes ? `
                    <div class="notes-box">
                      <div style="text-decoration: underline; margin-bottom: 2px;">Notes / ملاحظات:</div>
                      <div>${booking.notes}</div>
                    </div>
                    ` : ''}
                    
                    <div class="footer">
                        <p>Moreno Horizon - Spa & Resort</p>
                        <p>${new Date().toLocaleString()}</p>
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
    [t, lang, showToast],
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


    const totalPax = filteredBookings.reduce(
      (sum, b) => sum + (parseInt(b.guests) || 0),
      0,
    );

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
            <div className="flex flex-wrap gap-3 w-full md:w-auto justify-center md:justify-end">
              {notificationPermission !== "granted" && (
                <button
                  onClick={requestNotificationPermission}
                  className="px-6 py-3 bg-brand-orange/10 text-brand-orange hover:bg-brand-orange hover:text-white rounded-2xl font-black text-sm transition-all shadow-sm border border-brand-orange/20 flex items-center gap-2 cursor-pointer"
                >
                  <Bell size={18} className="animate-bounce" />
                  {lang === "ar" ? "🔔 تفعيل الإشعارات المنبثقة" : "🔔 Enable Push Notifications"}
                </button>
              )}
              {notificationPermission === "granted" && (
                <span className="px-6 py-3 bg-green-50 text-green-600 rounded-2xl font-bold text-xs border border-green-100 flex items-center gap-2 select-none">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                  {lang === "ar" ? "الإشعارات مفعلة" : "Notifications Active"}
                </span>
              )}
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
                className="px-8 py-3 bg-red-50 text-red-500 rounded-2xl font-black text-sm hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100 flex items-center gap-2 cursor-pointer"
              >
                <XCircle size={18} />
                {t.logout}
              </button>
            </div>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        {/* Bookings List */}
        <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-stone-100 mb-8">
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
                {filteredBookings.slice(0, visibleBookingsCount).map((b) => (
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
                              onClick={async () => {
                                const updateData = {
                                  status: "confirmed",
                                  updatedBy: currentUser.name,
                                  updatedAt: serverTimestamp(),
                                };
                                if (!b.tableNo) {
                                  const autoTable = findAvailableTable(b.date, b.resId, b.time, b.guests);
                                  if (autoTable) {
                                    updateData.tableNo = autoTable;
                                  }
                                }
                                await updateDoc(
                                  doc(db, "bookings", b.id.toString()),
                                  updateData
                                );
                              }}
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
                            onClick={async () => {
                              try {
                                await updateDoc(
                                  doc(db, "bookings", b.id.toString()),
                                  {
                                    status: "completed",
                                    updatedBy: currentUser.name,
                                    updatedAt: serverTimestamp(),
                                  },
                                );
                                setShareBooking(b);
                              } catch (err) {
                                console.error("Error completing booking:", err);
                              }
                            }}
                            className="bg-brand-blue text-white px-4 py-2 rounded-xl hover:bg-brand-blueHover font-bold shadow-sm transition-all text-sm flex items-center gap-1"
                          >
                            <Check size={16} /> {t.complete}
                          </button>
                        )}
                        {b.status === "waitlist" && (
                          <button
                            onClick={async () => {
                              try {
                                const updateData = {
                                  status: "confirmed",
                                  updatedBy: currentUser?.name || "Admin",
                                  updatedAt: serverTimestamp(),
                                };
                                if (!b.tableNo) {
                                  const autoTable = findAvailableTable(b.date, b.resId, b.time, b.guests);
                                  if (autoTable) {
                                    updateData.tableNo = autoTable;
                                  }
                                }
                                await updateDoc(
                                  doc(db, "bookings", b.id.toString()),
                                  updateData
                                );
                                showToast(
                                  lang === "ar"
                                    ? `تم ترقية وتأكيد حجز الضيف: ${b.name} بنجاح! 🎉`
                                    : `Upgraded and confirmed booking for: ${b.name} successfully! 🎉`
                                );
                              } catch (err) {
                                console.error("Error upgrading waitlist booking:", err);
                              }
                            }}
                            className="bg-gradient-to-r from-amber-500 to-brand-orange text-white px-4 py-2 rounded-xl hover:from-amber-600 hover:to-brand-orangeHover font-black shadow-sm transition-all text-sm flex items-center gap-1 cursor-pointer transform active:scale-95"
                          >
                            <Sparkles size={16} className="animate-spin-slow" /> {lang === "ar" ? "ترقية فوري" : "Instant Upgrade"}
                          </button>
                        )}
                        <button
                          onClick={() => printReceipt(b)}
                          title={lang === "ar" ? "طباعة الفاتورة" : "Print Receipt"}
                          className="bg-brand-blue/10 text-brand-blue px-3 py-2 rounded-xl hover:bg-brand-blue/20 font-bold shadow-sm transition-all text-sm flex items-center gap-1 cursor-pointer"
                        >
                          <Printer size={16} />
                        </button>

                        <button
                          onClick={() => printKitchenTicket(b)}
                          title={lang === "ar" ? "شيت المطبخ" : "Kitchen Ticket"}
                          className="bg-orange-500/10 text-orange-600 px-3 py-2 rounded-xl hover:bg-orange-500/20 font-bold shadow-sm transition-all text-sm flex items-center gap-1 cursor-pointer"
                        >
                          <ChefHat size={16} />
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
          {filteredBookings.length > visibleBookingsCount && (
            <div className="p-6 border-t border-stone-100 flex justify-center no-print bg-stone-50/30">
              <button
                onClick={() => setVisibleBookingsCount((prev) => prev + 10)}
                className="bg-brand-blue/10 hover:bg-brand-blue text-brand-blue hover:text-white px-8 py-3.5 rounded-2xl font-black text-sm transition-all shadow-sm hover:shadow-lg hover:shadow-brand-blue/15 flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
              >
                <span>✨</span>
                <span>
                  {lang === "ar"
                    ? `عرض المزيد (+${Math.min(10, filteredBookings.length - visibleBookingsCount)} من أصل ${filteredBookings.length - visibleBookingsCount} حجوزات متبقية)`
                    : `Show More (+${Math.min(10, filteredBookings.length - visibleBookingsCount)} of ${filteredBookings.length - visibleBookingsCount} remaining)`}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE TABLE MAP (خريطة الطاولات التفاعلية) */}
        {/* ========================================================================= */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-stone-100 relative overflow-hidden animate-fade-in mb-8 no-print">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-brand-blue"></div>

          {/* Header Area */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h3 className="text-2xl font-black text-brand-blue flex items-center gap-2">
                <Utensils className="text-emerald-500 animate-pulse" size={26} />
                <span>{lang === "ar" ? "خريطة الطاولات التفاعلية" : "Interactive Table Map"}</span>
                <span className="ms-2 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black shadow-sm flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  {lang === "ar" ? "مزامنة فورية ⚡" : "Live Synced ⚡"}
                </span>
              </h3>
              <p className="text-stone-400 text-xs mt-1.5 font-bold">
                {lang === "ar"
                  ? `عرض وإدارة توزيع الضيوف للغداء/العشاء ليوم: ${adminStartDate || todayStr}`
                  : `Visualize and manage guest seating layout for: ${adminStartDate || todayStr}`}
              </p>
            </div>

            {/* Quick Stats Summary */}
            <div className="flex gap-4 text-xs font-bold bg-stone-50 p-3 rounded-2xl border border-stone-100">
              <div className="text-center">
                <p className="text-stone-400 uppercase tracking-wider text-[9px] mb-0.5">{lang === "ar" ? "إجمالي الطاولات" : "Total Tables"}</p>
                <p className="text-stone-700 text-sm">
                  {selectedMapRes === "italian" ? ITALIAN_TABLES.length : ORIENTAL_TABLES.length}
                </p>
              </div>
              <div className="w-px bg-stone-200"></div>
              <div className="text-center">
                <p className="text-stone-400 uppercase tracking-wider text-[9px] mb-0.5">{lang === "ar" ? "المحجوزة" : "Booked"}</p>
                <p className="text-rose-600 text-sm">
                  {Object.keys(bookingsByTable).length}
                </p>
              </div>
              <div className="w-px bg-stone-200"></div>
              <div className="text-center">
                <p className="text-stone-400 uppercase tracking-wider text-[9px] mb-0.5">{lang === "ar" ? "الشاغرة" : "Available"}</p>
                <p className="text-emerald-600 text-sm">
                  {(selectedMapRes === "italian" ? ITALIAN_TABLES.length : ORIENTAL_TABLES.length) - Object.keys(bookingsByTable).length}
                </p>
              </div>
            </div>
          </div>

          {/* Map Filtering Controls */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-stone-50 p-4 rounded-3xl border border-stone-100 mb-8">
            <div className="flex flex-wrap gap-3">
              {/* Restaurant Buttons */}
              <button
                onClick={() => {
                  setSelectedMapRes("italian");
                  setSelectedMapTable(null);
                  setMovingBooking(null);
                }}
                className={`px-5 py-2.5 rounded-2xl text-sm font-black transition-all shadow-sm ${
                  selectedMapRes === "italian"
                    ? "bg-brand-blue text-white scale-[1.02]"
                    : "bg-white text-stone-500 hover:bg-stone-100"
                }`}
              >
                {lang === "ar" ? "🇮🇹 مطعم إيطالي (La Mama)" : "🇮🇹 Italian (La Mama)"}
              </button>
              <button
                onClick={() => {
                  setSelectedMapRes("oriental");
                  setSelectedMapTable(null);
                  setMovingBooking(null);
                }}
                className={`px-5 py-2.5 rounded-2xl text-sm font-black transition-all shadow-sm ${
                  selectedMapRes === "oriental"
                    ? "bg-brand-orange text-white scale-[1.02]"
                    : "bg-white text-stone-500 hover:bg-stone-100"
                }`}
              >
                {lang === "ar" ? "🇪🇬 مطعم شرقي (Aseel)" : "🇪🇬 Oriental (Aseel)"}
              </button>
            </div>

            {/* Shift selector (only for Italian) */}
            {selectedMapRes === "italian" && (
              <div className="flex gap-2 bg-white p-1.5 rounded-2xl shadow-inner border border-stone-200">
                <button
                  onClick={() => {
                    setSelectedMapTime(settings?.shift1 || "18:30 - 19:30");
                    setSelectedMapTable(null);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedMapTime === (settings?.shift1 || "18:30 - 19:30")
                      ? "bg-stone-900 text-white shadow-sm"
                      : "text-stone-500 hover:bg-stone-50"
                  }`}
                >
                  {lang === "ar"
                    ? `${t.shift1Label || "الفترة الأولى"} (${(settings?.shift1 || "18:30 - 19:30").split(" - ")[0]})`
                    : `${t.shift1Label || "First Shift"} (${(settings?.shift1 || "18:30 - 19:30").split(" - ")[0]})`}
                </button>
                <button
                  onClick={() => {
                    setSelectedMapTime(settings?.shift2 || "20:00 - 21:00");
                    setSelectedMapTable(null);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedMapTime === (settings?.shift2 || "20:00 - 21:00")
                      ? "bg-stone-900 text-white shadow-sm"
                      : "text-stone-500 hover:bg-stone-50"
                  }`}
                >
                  {lang === "ar"
                    ? `${t.shift2Label || "الفترة الثانية"} (${(settings?.shift2 || "20:00 - 21:00").split(" - ")[0]})`
                    : `${t.shift2Label || "Second Shift"} (${(settings?.shift2 || "20:00 - 21:00").split(" - ")[0]})`}
                </button>
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs font-bold text-stone-500 self-center">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 border border-emerald-400 inline-block"></span>
                <span>{lang === "ar" ? "شاغرة" : "Empty"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-500/20 border border-rose-400 inline-block"></span>
                <span>{lang === "ar" ? "محجوزة" : "Booked"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-blue-500/20 border border-blue-400 inline-block"></span>
                <span>{lang === "ar" ? "محددة" : "Selected"}</span>
              </div>
            </div>
          </div>

          {/* Move Banner Indicator */}
          {movingBooking && (
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-3xl mb-6 shadow-md flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <ArrowLeftRight size={22} className="text-white" />
                <span className="font-bold text-sm">
                  {lang === "ar"
                    ? `قيد النقل: الحجز الخاص بـ ${movingBooking.name} (غرفة ${movingBooking.room}) 🔄 انقر فوق أي طاولة فارغة لنقله إليها.`
                    : `Moving: Booking for ${movingBooking.name} (Room ${movingBooking.room}) 🔄 Click any empty table to seat them.`}
                </span>
              </div>
              <button
                onClick={() => setMovingBooking(null)}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-xl font-bold text-xs transition-all"
              >
                {lang === "ar" ? "إلغاء النقل" : "Cancel"}
              </button>
            </div>
          )}

          {/* Main Map + Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Visual Floor Plan BluePrint */}
            <div className="lg:col-span-3 relative">
              <div className="relative w-full aspect-[16/9] min-h-[350px] md:min-h-[480px] bg-stone-900 border border-stone-800 rounded-[2.5rem] p-6 overflow-hidden shadow-2xl">
                
                {/* Subtle Floor Grid lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#2d2d30_1px,transparent_1px),linear-gradient(to_bottom,#2d2d30_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30"></div>
                
                {/* Dining Zone Division */}

                {/* Zone Dividers (Subtle dashed borders) */}
                <div className="absolute top-0 bottom-0 left-[55%] border-l border-dashed border-stone-700/50 pointer-events-none"></div>
                <div className="absolute top-0 bottom-0 left-[75%] border-l border-dashed border-stone-700/50 pointer-events-none"></div>

                {/* Draw Tables */}
                {(selectedMapRes === "italian" ? ITALIAN_TABLES : ORIENTAL_TABLES).map((t) => {
                  const assignedBooking = bookingsByTable[t.name];
                  const isOccupied = !!assignedBooking;
                  const isSelected = selectedMapTable && selectedMapTable.id === t.id;
                  const isMoveTarget = movingBooking && !isOccupied;

                  // Node color styles
                  let statusClass = "border-emerald-500/30 bg-stone-900/60 text-emerald-400 neon-glow-green hover:border-emerald-400/60 hover:bg-emerald-500/10 z-10";
                  let pulseDot = "bg-emerald-500";

                  if (isOccupied) {
                    statusClass = "border-rose-500/30 bg-stone-900/60 text-rose-400 neon-glow-rose hover:border-rose-400/60 hover:bg-rose-500/10 z-10";
                    pulseDot = "bg-rose-500";
                  }
                  if (isSelected) {
                    statusClass = "border-blue-500/60 bg-stone-850/80 text-blue-300 neon-glow-blue z-20 selected-table";
                    pulseDot = "bg-blue-500";
                  }
                  if (isMoveTarget) {
                    statusClass = "border-blue-400/50 bg-blue-500/5 text-blue-400 hover:bg-blue-500/15 cursor-pointer animate-pulse z-20";
                    pulseDot = "bg-blue-400";
                  }

                  // Rounded / Rectangle layouts
                  const shapeClass = t.type === "round"
                    ? "rounded-full w-16 h-16 md:w-20 md:h-20"
                    : t.type === "square"
                      ? "rounded-3xl w-16 h-16 md:w-20 md:h-20"
                      : "rounded-3xl w-24 h-16 md:w-28 md:h-20";

                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        if (isMoveTarget) {
                          // Complete transfer
                          assignTableToBooking(movingBooking.id, t.name);
                          setMovingBooking(null);
                        } else {
                          setSelectedMapTable(t);
                        }
                      }}
                      className={`absolute flex flex-col items-center justify-center border-2 shadow-lg backdrop-blur-md floor-table-btn ${shapeClass} ${statusClass}`}
                      style={{
                        left: `${t.x}%`,
                        top: `${t.y}%`,
                      }}
                    >
                      {/* Pulsing indicator top-right */}
                      <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseDot}`}></span>
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${pulseDot}`}></span>
                      </span>

                      {/* Table Label */}
                      <span className="text-xs font-black uppercase tracking-wider block opacity-70 mb-0.5">
                        {lang === "ar" ? `طاولة ${t.name}` : `Table ${t.name}`}
                      </span>

                      {/* Seating PAX Capacity */}
                      <span className="text-[10px] font-black opacity-50 block mb-1">
                        👥 {t.seats}
                      </span>

                      {/* Assigned Guest Short Info */}
                      {isOccupied && (
                        <div className="px-1.5 py-0.5 bg-black/30 rounded-md max-w-[90%] overflow-hidden text-[9px] font-black tracking-wide text-rose-300 truncate text-center">
                          {assignedBooking.room ? `G-${assignedBooking.room}` : ""}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Side Control Panel */}
            <div className="lg:col-span-1">
              {!selectedMapTable ? (
                // Unselected / Stats State
                <div className="bg-stone-50 border border-stone-200 p-6 rounded-[2rem] flex flex-col justify-between h-full min-h-[300px]">
                  <div>
                    <h4 className="text-stone-700 font-black text-lg mb-3">
                      {lang === "ar" ? "إدارة الصالة" : "Floor Manager"}
                    </h4>
                    <p className="text-stone-400 text-xs font-bold leading-relaxed">
                      {lang === "ar"
                        ? "حدد أي طاولة من الخريطة للبدء بتسكين الضيوف، أو تعديل الحجوزات، أو تسجيل حجز مباشر (Walk-In)."
                        : "Select any table from the blueprint to seat guests, shift bookings, or log direct walk-ins."}
                    </p>
                  </div>

                  {/* Occupancy Progress */}
                  <div className="mt-6 space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-bold text-stone-500 mb-1.5">
                        <span>{lang === "ar" ? "نسبة إشغال الطاولات" : "Table Occupancy"}</span>
                        <span>
                          {Math.round(
                            ((Object.keys(bookingsByTable).length) / 
                            (selectedMapRes === "italian" ? ITALIAN_TABLES.length : ORIENTAL_TABLES.length)) * 100
                          )}%
                        </span>
                      </div>
                      <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full transition-all duration-500"
                          style={{
                            width: `${((Object.keys(bookingsByTable).length) / (selectedMapRes === "italian" ? ITALIAN_TABLES.length : ORIENTAL_TABLES.length)) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-stone-200 pt-6 mt-6">
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-3">
                      {lang === "ar" ? "قائمة الانتظار النشطة" : "Active Waitlist"}
                    </span>
                    <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-stone-100 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                        <span className="text-stone-700 font-bold text-xs">
                          {lang === "ar" ? "ضيوف في الانتظار" : "Waitlisted Guests"}
                        </span>
                      </div>
                      <span className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-xl text-[10px] font-black shadow-sm">
                        {waitlistBookings.length}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                // Table Selected State
                <div className="bg-stone-50 border border-stone-200 p-6 rounded-[2rem] flex flex-col justify-between h-full min-h-[380px] animate-fade-in relative">
                  <button
                    onClick={() => setSelectedMapTable(null)}
                    className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-full transition-all"
                  >
                    <XCircle size={18} />
                  </button>

                  {/* Table Header Details */}
                  <div>
                    <span className="bg-stone-200 text-stone-600 px-3 py-1 rounded-full text-[9px] font-black tracking-wider uppercase inline-block mb-3">
                      {selectedMapTable.zone === "indoor"
                        ? (lang === "ar" ? "الصالة الداخلية" : "Indoor")
                        : selectedMapTable.zone === "vip"
                          ? (lang === "ar" ? "ركن VIP الفاخر" : "VIP Suite")
                          : (lang === "ar" ? "التراس الخارجي" : "Outdoor")}
                    </span>
                    <h4 className="text-stone-800 font-black text-xl leading-tight">
                      {lang === "ar" ? `طاولة رقم ${selectedMapTable.name}` : `Table Number ${selectedMapTable.name}`}
                    </h4>
                    <p className="text-stone-400 text-xs font-bold mt-1">
                      👥 {lang === "ar" ? `${selectedMapTable.seats} مقاعد كحد أقصى` : `Max Seats: ${selectedMapTable.seats}`}
                    </p>

                    <div className="border-b border-stone-200 my-5"></div>

                    {/* Check if Table is Occupied */}
                    {bookingsByTable[selectedMapTable.name] ? (
                      // Occupied state content
                      (() => {
                        const guest = bookingsByTable[selectedMapTable.name];
                        return (
                          <div className="space-y-4 animate-fade-in">
                            <div>
                              <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider block mb-1">
                                {lang === "ar" ? "النزيل المسجل" : "Registered Guest"}
                              </span>
                              <p className="text-stone-800 font-black text-base">{guest.name}</p>
                              <div className="flex gap-2 mt-1.5">
                                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-emerald-100">
                                  🏢 {lang === "ar" ? `غرفة ${guest.room}` : `Room ${guest.room}`}
                                </span>
                                <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-rose-100">
                                  👥 {guest.guests} {lang === "ar" ? "أفراد" : "PAX"}
                                </span>
                              </div>
                            </div>

                            {guest.phone && (
                              <div>
                                <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider block mb-1">
                                  {lang === "ar" ? "رقم الاتصال" : "Contact Number"}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-stone-600 text-xs font-bold" dir="ltr">{guest.phone}</span>
                                  <a
                                    href={`tel:${guest.phone}`}
                                    className="p-1 bg-white hover:bg-stone-200 rounded-lg text-stone-600 transition-all border border-stone-100 shadow-sm"
                                  >
                                    <Phone size={12} />
                                  </a>
                                </div>
                              </div>
                            )}

                            {guest.notes && (
                              <div>
                                <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider block mb-1">
                                  {lang === "ar" ? "الملاحظات" : "Notes"}
                                </span>
                                <p className="text-stone-500 text-xs font-bold bg-white p-2 rounded-xl border border-stone-100">
                                  {guest.notes}
                                </p>
                              </div>
                            )}

                            <div className="border-b border-stone-200 my-5"></div>

                            {/* Actions Group */}
                            <div className="space-y-2">
                              <button
                                onClick={() => completeBookingFromMap(guest.id)}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                              >
                                <CheckCircle size={14} />
                                {lang === "ar" ? "إنهاء الحجز والتحرير 🧹" : "Complete & Free Table 🧹"}
                              </button>

                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  onClick={() => setMovingBooking(guest)}
                                  className="bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                                >
                                  <ArrowLeftRight size={12} className="text-blue-500" />
                                  {lang === "ar" ? "نقل طاولة" : "Move Table"}
                                </button>
                                <button
                                  onClick={() => unassignTable(guest.id)}
                                  className="bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                                >
                                  <Unlock size={12} className="text-stone-500" />
                                  {lang === "ar" ? "إلغاء تعيين" : "Unseat"}
                                </button>
                              </div>

                              <button
                                onClick={() => printReceipt(guest)}
                                className="w-full bg-brand-blue/10 hover:bg-brand-blue/15 text-brand-blue py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all"
                              >
                                <Printer size={12} />
                                {lang === "ar" ? "طباعة الفاتورة 🧾" : "Print Receipt 🧾"}
                              </button>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      // Empty state content (Assign flow)
                      <div className="space-y-4 animate-fade-in">
                        {unassignedBookings.length > 0 ? (
                          <div>
                            <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider block mb-2">
                              {lang === "ar" ? "تسكين ضيف مؤكد" : "Seat Confirmed Booking"}
                            </span>
                            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                              {unassignedBookings.map((b) => (
                                <button
                                  key={b.id}
                                  onClick={() => assignTableToBooking(b.id, selectedMapTable.name)}
                                  className="w-full bg-white hover:bg-emerald-50/50 border border-stone-200 hover:border-emerald-300 p-3 rounded-2xl flex flex-col text-start transition-all shadow-sm group"
                                >
                                  <span className="font-bold text-stone-800 text-xs group-hover:text-emerald-700">{b.name}</span>
                                  <div className="flex justify-between items-center w-full mt-1">
                                    <span className="text-[10px] text-stone-400 font-bold">
                                      🏢 {lang === "ar" ? `غرفة ${b.room}` : `Room ${b.room}`} | 👥 {b.guests} {lang === "ar" ? "أفراد" : "PAX"}
                                    </span>
                                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all">
                                      {lang === "ar" ? "تسكين 🪑" : "Seat 🪑"}
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white p-4 rounded-2xl border border-stone-100 text-center">
                            <p className="text-stone-400 text-xs font-bold leading-normal">
                              {lang === "ar"
                                ? "لا يوجد حجوزات معلقة للتسكين في هذه الفترة."
                                : "No confirmed bookings to seat in this shift."}
                            </p>
                          </div>
                        )}

                        <div className="border-b border-stone-200 my-5"></div>

                        {/* Direct Booking Shortcut */}
                        <div>
                          <button
                            onClick={() => {
                              setWalkInGuests(selectedMapTable.seats.toString());
                              setShowWalkInModal(true);
                            }}
                            className="w-full bg-brand-orange text-white py-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-brand-orangeHover transition-all shadow-md shadow-brand-orange/15"
                          >
                            <UserPlus size={14} />
                            {lang === "ar" ? "إضافة حجز مباشر (Walk-In) ➕" : "Create Walk-In Booking ➕"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* AUTOMATED GUEST REMINDER CENTER (مركز تذكير نزلاء الفندق قبل الحجز) */}
        {/* ========================================================================= */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-stone-100 relative overflow-hidden animate-fade-in mb-8 no-print">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 via-brand-orange to-brand-blue"></div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h3 className="text-xl font-black text-brand-blue flex items-center gap-2">
                <BellRing className="text-brand-orange animate-bounce" size={24} />
                <span>{lang === "ar" ? "مركز التذكير التلقائي للنزلاء" : "Automated Guest Reminder Center"}</span>
                <span className="ms-2 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-xl text-xs font-black shadow-sm flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                  {lang === "ar" ? "نشط حالياً ⚡" : "Active ⚡"}
                </span>
              </h3>
              <p className="text-stone-400 text-xs mt-1 font-bold">
                {lang === "ar" 
                  ? "تنبيهات وتذكيرات تلقائية تُرسل للنزلاء قبل موعد الحجز بساعة لتقليل نسبة التغيب (No-Show)" 
                  : "Automatic alerts and WhatsApp templates triggered 1 hour before reservation to prevent no-shows"}
              </p>
            </div>

            {/* Notification Permission Quick Action */}
            <button
              onClick={requestNotificationPermission}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
                notificationPermission === "granted"
                  ? "bg-green-50 text-green-600 border border-green-200"
                  : "bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 animate-pulse"
              }`}
            >
              <span>🔔</span>
              <span>
                {notificationPermission === "granted"
                  ? (lang === "ar" ? "إشعارات المتصفح مفعّلة" : "Browser Alerts Active")
                  : (lang === "ar" ? "تفعيل إشعارات المتصفح" : "Enable Browser Alerts")}
              </span>
            </button>
          </div>

          {upcomingReminders.length === 0 ? (
            <div className="text-center py-10 px-4 bg-emerald-50/20 rounded-[1.5rem] border border-emerald-100">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                <CheckCircle size={28} className="animate-pulse" />
              </div>
              <p className="font-black text-emerald-800 text-sm">
                {lang === "ar" 
                  ? "رائع! جميع النزلاء القادمين خلال الساعتين القادمتين تم تذكيرهم بنجاح! 🎉" 
                  : "Awesome! All guests arriving within the next 2 hours have been reminded! 🎉"}
              </p>
              <p className="text-[10px] text-emerald-600 mt-1 font-bold">
                {lang === "ar" ? "معدل الحضور مستقر ومضمون بنسبة 100%." : "Attendance rate is secured and highly optimized."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingReminders.map((b) => {
                const startMs = getBookingStartMs(b.date, b.time);
                const diffMin = startMs ? Math.round((startMs - Date.now()) / 60000) : 0;
                
                return (
                  <div 
                    key={b.id} 
                    className="bg-stone-50 border border-stone-200 hover:border-brand-orange/40 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group flex flex-col justify-between"
                  >
                    {/* Glowing Accent line inside card */}
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-orange/60"></div>
                    
                    <div>
                      {/* Booking Tag */}
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <span className="bg-white text-stone-600 px-2.5 py-1 rounded-lg text-[9px] font-black border border-stone-100 uppercase tracking-wider inline-block">
                          {b.restaurant && b.restaurant.includes("La Mama") 
                            ? "🇮🇹 La Mama" 
                            : "🇪🇬 Aseel"}
                        </span>
                        
                        {/* Countdown Pill */}
                        <span className="bg-amber-50 text-amber-600 text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-inner animate-pulse">
                          <span>⏰</span>
                          <span>
                            {lang === "ar" 
                              ? `يبدأ خلال ${diffMin} د` 
                              : `Starts in ${diffMin}m`}
                          </span>
                        </span>
                      </div>

                      {/* Guest Details */}
                      <h4 className="text-stone-800 font-black text-sm group-hover:text-brand-orange transition-colors">
                        {b.name}
                      </h4>
                      <p className="text-stone-400 text-xs font-bold mt-1 flex items-center gap-1.5">
                        <span>🏢 {lang === "ar" ? `غرفة ${b.room}` : `Room ${b.room}`}</span>
                        <span>•</span>
                        <span>👥 {b.guests} {lang === "ar" ? "أفراد" : "PAX"}</span>
                      </p>

                      <p className="text-stone-600 text-xs font-black mt-2 bg-white/80 p-2 rounded-xl border border-stone-100 flex items-center gap-1">
                        <span>🕒</span>
                        <span>{lang === "ar" ? `موعد الحجز: ${b.time}` : `Reserved at: ${b.time}`}</span>
                      </p>
                    </div>

                    {/* Notification trigger button */}
                    <div className="mt-5">
                      <button
                        onClick={() => sendReminder(b)}
                        className="w-full bg-brand-orange hover:bg-brand-orangeHover text-white py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-orange/10 cursor-pointer"
                      >
                        <Send size={12} className="animate-pulse" />
                        {lang === "ar" ? "إرسال تذكير WhatsApp ⏰" : "Send WhatsApp Reminder ⏰"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Smart Waitlist Manager Panel */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-stone-100 relative overflow-hidden animate-fade-in mb-8">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-brand-orange"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h3 className="text-xl font-black text-brand-blue flex items-center gap-2">
                <Sparkles className="text-amber-500 animate-pulse" size={24} />
                <span>{lang === "ar" ? "نظام الانتظار الذكي" : "Smart Waitlist Manager"}</span>
                <span className="ms-2 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-xl text-xs font-black shadow-sm">
                  {waitlistBookings.length} {lang === "ar" ? "في الانتظار" : "Waiting"}
                </span>
              </h3>
              <p className="text-stone-400 text-xs mt-1 font-bold">
                {lang === "ar" 
                  ? "قم بترقية الحجوزات فوراً عند توفر طاولات شاغرة لضمان الإشغال الكامل" 
                  : "Instantly upgrade reservations when tables open up to ensure maximum occupancy"}
              </p>
            </div>
          </div>

          {waitlistBookings.length === 0 ? (
            <div className="text-center py-12 px-4 bg-stone-50/50 rounded-[1.5rem] border border-dashed border-stone-200">
              <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <CheckCircle size={32} />
              </div>
              <p className="font-bold text-stone-600 text-base">
                {lang === "ar" 
                  ? "قائمة الانتظار فارغة حالياً. جميع الضيوف لديهم حجوزات مؤكدة! 🎉" 
                  : "The waitlist is currently empty. All guests have confirmed bookings! 🎉"}
              </p>
              <p className="text-xs text-stone-400 mt-1 font-bold">
                {lang === "ar" ? "طاولاتك مستغلة بشكل مثالي ومباشر." : "Your tables are perfectly utilized."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {waitlistBookings.map((b) => {
                // Determine capacity for this waitlisted booking
                const maxCap = b.resId === "italian" 
                  ? (settings.capacityItalian || 80) 
                  : (settings.capacityOriental || 30);
                
                const currentOccupancy = getOccupancy(b.date, b.resId, b.resId === "italian" ? b.time : null);
                const remainingSeats = Math.max(0, maxCap - currentOccupancy);
                const requestedGuests = Number(b.guests || 1);
                const hasCapacity = remainingSeats >= requestedGuests;

                return (
                  <div 
                    key={b.id} 
                    className="group relative bg-stone-50/40 hover:bg-white p-5 rounded-3xl border border-stone-100 hover:border-amber-400/50 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden"
                  >
                    {/* Background accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-orange/10 transition-all duration-500"></div>
                    
                    <div>
                      {/* Ticket Header */}
                      <div className="flex justify-between items-start gap-2 mb-4">
                        <div>
                          <h4 className="font-black text-brand-blue text-base leading-tight group-hover:text-brand-orange transition-colors">
                            {b.name}
                          </h4>
                          <span className="text-stone-400 font-bold text-xs mt-1 block" dir="ltr">
                            {b.phone}
                          </span>
                        </div>
                        <span className="bg-amber-500/10 text-brand-orange px-3 py-1.5 rounded-2xl text-xs font-black shrink-0 shadow-sm flex items-center gap-1">
                          <Users size={12} />
                          {b.guests} {lang === "ar" ? "أفراد" : "PAX"}
                        </span>
                      </div>

                      {/* Info lines */}
                      <div className="space-y-2 text-xs font-bold text-stone-600 mb-5 relative z-10">
                        <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-stone-100/50">
                          <span className="text-stone-400">{lang === "ar" ? "رقم الغرفة:" : "Room:"}</span>
                          <span className="text-brand-blue font-black bg-brand-orange/5 px-2 py-0.5 rounded-lg">{b.room}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-stone-100/50">
                          <span className="text-stone-400">{lang === "ar" ? "المطعم:" : "Restaurant:"}</span>
                          <span className="text-stone-800">{b.restaurant}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-stone-100/50">
                          <span className="text-stone-400">{lang === "ar" ? "التاريخ والوقت:" : "Date & Time:"}</span>
                          <span className="text-stone-800">
                            {b.date} <span className="text-brand-orange">({b.time || "19:00 - 20:00"})</span>
                          </span>
                        </div>
                      </div>

                      {/* Live capacity helper */}
                      <div className="mb-5 p-3 rounded-2xl border bg-white flex flex-col gap-1.5 text-[11px] font-bold shadow-sm">
                        <div className="flex justify-between text-stone-500">
                          <span>{lang === "ar" ? "المقاعد المتبقية:" : "Remaining seats:"}</span>
                          <span className={remainingSeats > 0 ? "text-green-600 font-black" : "text-red-500 font-black"}>
                            {remainingSeats} {lang === "ar" ? "مقعد" : "seats"}
                          </span>
                        </div>
                        {hasCapacity ? (
                          <span className="text-green-600 flex items-center gap-1 bg-green-50/50 px-2.5 py-1 rounded-xl text-[10px]">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            {lang === "ar" ? "يتوفر سعة كافية للترقية الفورية" : "Sufficient capacity available for upgrade"}
                          </span>
                        ) : (
                          <span className="text-red-500 flex items-center gap-1 bg-red-50/50 px-2.5 py-1 rounded-xl text-[10px]">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            {lang === "ar" ? "السعة غير كافية (يتطلب تجاوز الحد)" : "Capacity full (requires limit override)"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Instant Upgrade Button */}
                    <button
                      onClick={async () => {
                        try {
                          const updateData = {
                            status: "confirmed",
                            updatedBy: currentUser?.name || "Admin",
                            updatedAt: serverTimestamp(),
                          };
                          if (!b.tableNo) {
                            const autoTable = findAvailableTable(b.date, b.resId, b.time, b.guests);
                            if (autoTable) {
                              updateData.tableNo = autoTable;
                            }
                          }
                          await updateDoc(
                            doc(db, "bookings", b.id.toString()),
                            updateData
                          );
                          showToast(
                            lang === "ar"
                              ? `تم ترقية وتأكيد حجز الضيف: ${b.name} بنجاح! 🎉`
                              : `Upgraded and confirmed booking for: ${b.name} successfully! 🎉`
                          );
                        } catch (err) {
                          console.error("Error upgrading waitlist booking:", err);
                        }
                      }}
                      className="w-full bg-gradient-to-r from-amber-500 to-brand-orange hover:from-amber-600 hover:to-brand-orangeHover text-white py-3 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 transform active:scale-95 cursor-pointer border border-brand-orange/10"
                    >
                      <Sparkles size={16} className="animate-spin-slow" />
                      <span>{lang === "ar" ? "ترقية فوري ✨" : "Instant Upgrade ✨"}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
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
            <AnalyticsDashboard bookings={bookings} t={t} lang={lang} />
            <FeedbackPanel db={db} t={t} lang={lang} showToast={showToast} />

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
              currentUser={currentUser}
              lang={lang}
            />
          </div>
        )}

        {/* QR Code Section */}
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-stone-100 flex flex-col items-center text-center mt-12 animate-fade-in">
          <h3 className="text-2xl font-bold text-brand-blue mb-6">
            {t.qrTitle}
          </h3>
          <div className="bg-stone-50 p-6 rounded-3xl shadow-inner border border-stone-200">
            <QRCodeSVG
              value="https://moreno-horizon-restaurant.vercel.app/"
              size={200}
              fgColor="#1e293b"
            />
          </div>
          <p className="text-stone-500 font-bold mt-6">
            {t.printQrInstruction}
          </p>
        </div>
      </div>

      {/* Feedback Share Modal Overlay */}
      {shareBooking && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-md z-[150] flex items-center justify-center p-4 animate-fade-in no-print">
          <div className="bg-white/95 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-stone-100 max-w-lg w-full relative overflow-hidden animate-scale-up">
            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-amber-400 via-brand-orange to-brand-blue"></div>
            
            <button
              onClick={() => setShareBooking(null)}
              className="absolute top-6 right-6 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-all"
            >
              <XCircle size={22} />
            </button>

            <div className="text-center mb-6">
              <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block mb-3 shadow-sm">
                ⭐ {lang === "ar" ? "نظام التقييم التلقائي" : "Automated Feedback System"}
              </span>
              <h3 className="text-2xl font-black text-brand-blue leading-tight">
                {lang === "ar" ? "إرسال رابط استبيان النزيل" : "Send Guest Survey Link"}
              </h3>
              <p className="text-stone-400 text-xs mt-1.5 font-bold">
                {lang === "ar"
                  ? `الحجز الخاص بـ: ${shareBooking.name} (غرفة ${shareBooking.room})`
                  : `Booking for: ${shareBooking.name} (Room ${shareBooking.room})`}
              </p>
            </div>

            <div className="space-y-4">
              {/* Info panel */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 text-xs text-stone-500 font-bold space-y-1">
                <div className="flex justify-between">
                  <span>{lang === "ar" ? "المطعم:" : "Restaurant:"}</span>
                  <span className="text-brand-blue">{shareBooking.restaurant}</span>
                </div>
                <div className="flex justify-between">
                  <span>{lang === "ar" ? "رقم الهاتف:" : "Phone:"}</span>
                  <span className="text-stone-700" dir="ltr">{shareBooking.phone}</span>
                </div>
              </div>

              {/* Message preview */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">
                  {lang === "ar" ? "معاينة الرسالة المقترحة" : "Suggested Message Preview"}
                </label>
                <div className="bg-stone-50/50 p-4 rounded-xl border border-stone-200 text-stone-600 text-xs font-semibold leading-relaxed whitespace-pre-wrap shadow-inner relative">
                  {lang === "ar"
                    ? `مرحباً ${shareBooking.name}، يسعدنا جداً أنك شاركتنا وجبة العشاء اليوم في ${shareBooking.restaurant} الفاخر بمنتجع Moreno Horizon! 🥰\n\nنود معرفة رأيك وتقييمك لتجربتك معنا لمساعدتنا في تحسين خدماتنا وتقديم تجربة تليق بك دائماً 🌟\n\nرابط التقييم السريع:\n${window.location.origin}?view=feedback&id=${shareBooking.id}`
                    : `Hi ${shareBooking.name}, we hope you had an exquisite dining experience with us today at the Moreno Horizon ${shareBooking.restaurant}! 🥰\n\nWe would love to hear your feedback to help us continually elevate our services for your comfort 🌟\n\nQuick Rating Link:\n${window.location.origin}?view=feedback&id=${shareBooking.id}`}
                </div>
              </div>

              {/* Actions row */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <button
                  onClick={() => {
                    const msg = lang === "ar"
                      ? `مرحباً ${shareBooking.name}، يسعدنا جداً أنك شاركتنا وجبة العشاء اليوم في ${shareBooking.restaurant} الفاخر بمنتجع Moreno Horizon! 🥰\n\nنود معرفة رأيك وتقييمك لتجربتك معنا لمساعدتنا في تحسين خدماتنا وتقديم تجربة تليق بك دائماً 🌟\n\nرابط التقييم السريع:\n${window.location.origin}?view=feedback&id=${shareBooking.id}`
                      : `Hi ${shareBooking.name}, we hope you had an exquisite dining experience with us today at the Moreno Horizon ${shareBooking.restaurant}! 🥰\n\nWe would love to hear your feedback to help us continually elevate our services for your comfort 🌟\n\nQuick Rating Link:\n${window.location.origin}?view=feedback&id=${shareBooking.id}`;
                    
                    const cleanPhone = shareBooking.phone.replace(/[+\s-]/g, "");
                    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
                    window.open(whatsappUrl, "_blank");
                    setShareBooking(null);
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Share2 size={16} />
                  {lang === "ar" ? "إرسال عبر WhatsApp" : "Send via WhatsApp"}
                </button>

                <button
                  onClick={() => {
                    const link = `${window.location.origin}?view=feedback&id=${shareBooking.id}`;
                    navigator.clipboard.writeText(link);
                    showToast(lang === "ar" ? "تم نسخ رابط التقييم بنجاح!" : "Feedback link copied!");
                    setShareBooking(null);
                  }}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 py-3 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 border border-stone-200 transition-all cursor-pointer"
                >
                  <Copy size={16} />
                  {lang === "ar" ? "نسخ الرابط فقط" : "Copy Link Only"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Direct Walk-In Booking Modal */}
      {showWalkInModal && selectedMapTable && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-md z-[160] flex items-center justify-center p-4 animate-fade-in no-print">
          <div className="bg-white/95 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-stone-100 max-w-md w-full relative overflow-hidden animate-scale-up">
            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-brand-orange to-brand-blue"></div>
            
            <button
              onClick={() => setShowWalkInModal(false)}
              className="absolute top-6 right-6 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-all"
            >
              <XCircle size={22} />
            </button>

            <div className="text-center mb-6">
              <span className="bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block mb-3 shadow-sm">
                🚶 {lang === "ar" ? "تسجيل حجز مباشر" : "Walk-In Reservation"}
              </span>
              <h3 className="text-2xl font-black text-brand-blue leading-tight">
                {lang === "ar" ? `تسكين سريع - طاولة ${selectedMapTable.name}` : `Quick Seat - Table ${selectedMapTable.name}`}
              </h3>
              <p className="text-stone-400 text-xs mt-1.5 font-bold">
                {lang === "ar"
                  ? `سيتم حفظ هذا الحجز فوراً كـ "مؤكد" وتسكينه على طاولة ${selectedMapTable.name}`
                  : `This booking will be instantly saved as "Confirmed" on table ${selectedMapTable.name}`}
              </p>
            </div>

            <div className="space-y-4">
              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">
                  {lang === "ar" ? "اسم النزيل (مطلوب)" : "Guest Name (Required)"}
                </label>
                <input
                  type="text"
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  placeholder={lang === "ar" ? "مثال: أحمد علي" : "e.g. Ahmad Ali"}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-brand-orange transition-all"
                />
              </div>

              {/* Room & Guests Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">
                    {lang === "ar" ? "رقم الغرفة (اختياري)" : "Room No (Optional)"}
                  </label>
                  <input
                    type="text"
                    value={walkInRoom}
                    onChange={(e) => setWalkInRoom(e.target.value)}
                    placeholder="e.g. 102"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-brand-orange transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">
                    {lang === "ar" ? "عدد الأفراد" : "No. of Guests"}
                  </label>
                  <input
                    type="number"
                    value={walkInGuests}
                    onChange={(e) => setWalkInGuests(e.target.value)}
                    max={selectedMapTable.seats}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-brand-orange transition-all"
                  />
                </div>
              </div>

              {/* Phone Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">
                  {lang === "ar" ? "رقم الهاتف" : "Phone Number"}
                </label>
                <input
                  type="text"
                  value={walkInPhone}
                  onChange={(e) => setWalkInPhone(e.target.value)}
                  placeholder="e.g. +201000..."
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-brand-orange transition-all"
                />
              </div>

              {/* Notes Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">
                  {lang === "ar" ? "الملاحظات" : "Special Requests"}
                </label>
                <textarea
                  value={walkInNotes}
                  onChange={(e) => setWalkInNotes(e.target.value)}
                  placeholder={lang === "ar" ? "أي متمتطلبات خاصة بالنزيل..." : "Any special dietary requirements..."}
                  rows={2}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-brand-orange transition-all resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowWalkInModal(false)}
                  className="flex-1 px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-500 rounded-2xl text-xs font-black transition-all"
                >
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  onClick={saveWalkInBooking}
                  className="flex-1 px-6 py-3 bg-brand-orange hover:bg-brand-orangeHover text-white rounded-2xl text-xs font-black transition-all shadow-md"
                >
                  {lang === "ar" ? "تأكيد وتسكين ✨" : "Confirm & Seat ✨"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const MemoizedAdminView = memo(AdminView);
MemoizedAdminView.displayName = "AdminView";

export default MemoizedAdminView;
