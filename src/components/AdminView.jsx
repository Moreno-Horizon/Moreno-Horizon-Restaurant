import { memo, useState, useEffect, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { translations } from "../translations";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, signInAnonymously } from "firebase/auth";
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
import SettingsPanel from "./admin/SettingsPanel";
import UsersPanel from "./admin/UsersPanel";
import LogsPanel from "./admin/LogsPanel";
import BlacklistPanel from "./admin/BlacklistPanel";
import CustomerDatabasePanel from "./admin/CustomerDatabasePanel";
import AnalyticsDashboard from "./admin/AnalyticsDashboard";
import FeedbackPanel from "./admin/FeedbackPanel";
import TableMapPanel from "./admin/TableMapPanel";
import ReminderCenterPanel from "./admin/ReminderCenterPanel";
import WaitlistManagerPanel from "./admin/WaitlistManagerPanel";
import OrderEditorModal from "./admin/OrderEditorModal";
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
  getDoc,
  addDoc,
  orderBy,
  limit,
  onSnapshot,
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
  fetchUsers,
  showToast,
  blacklist,
  MENU_ITEMS,
  setView,
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
  const [logs, setLogs] = useState([]);

  const isReadOnlyUser = useMemo(() => {
    if (!currentUser) return false;
    const name = (currentUser.name || "").toLowerCase();
    const username = (currentUser.username || "").toLowerCase();
    return name.startsWith("fb.name") || 
           username.startsWith("fb.name") || 
           name.startsWith("chef.name") || 
           username.startsWith("chef.name");
  }, [currentUser]);

  const isGrUser = useMemo(() => {
    if (!currentUser) return false;
    const name = (currentUser.name || "").toLowerCase();
    const username = (currentUser.username || "").toLowerCase();
    return name.startsWith("gr.name") || username.startsWith("gr.name");
  }, [currentUser]);

  useEffect(() => {
    showToast("AdminView Mounted", 1000);
  }, [showToast]);

  useEffect(() => {
    if (adminRole === "main") {
      if (!auth.currentUser) {
        signInAnonymously(auth).catch(console.error);
      }
      
      const fetchLogs = async () => {
        try {
          const q = query(collection(db, "audit_logs"), orderBy("timestamp", "desc"), limit(100));
          const snapshot = await getDocs(q);
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setLogs(data);
        } catch (error) {
          console.error("Error fetching logs:", error);
          showToast("Error loading logs: " + error.message, 5000);
        }
      };
      fetchLogs();
    }
  }, [adminRole, showToast]);

  const addLog = async (action, details) => {
    try {
      await addDoc(collection(db, "audit_logs"), {
        action,
        details,
        userId: currentUser?.uid || "unknown",
        userName: currentUser?.name || currentUser?.username || "System",
        timestamp: serverTimestamp(),
      });
    } catch (e) {
      console.error("Error adding log:", e);
    }
  };

  const handleAdminLogin = async () => {
    // Try Firebase Auth FIRST
    try {
      const email = adminUser.includes("@") ? adminUser : `${adminUser}@lamama.com`;
      const userCredential = await signInWithEmailAndPassword(auth, email, adminPass);
      const user = userCredential.user;
      
      // Fetch user doc from Firestore using UID
      console.log("Searching for user doc with UID:", user.uid);
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setAdminRole(userData.role);
        setCurrentUser(userData);
        setIsAdminAuth(true);
        
        localStorage.setItem("morenoAdminAuth", "true");
        localStorage.setItem("morenoAdminRole", userData.role);
        localStorage.setItem("morenoCurrentUser", JSON.stringify(userData));
        return;
      } else {
        showToast("User document not found in Firestore", 5000);
      }
    } catch (authError) {
      console.error("Login Error:", authError);
      showToast(lang === "ar" ? "اسم المستخدم أو كلمة المرور غير صحيحة" : "Invalid username or password", 5000);
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
      let start = adminStartDate;
      let end = adminEndDate;
      if (start && end && start > end) {
        [start, end] = [end, start];
      }

      // Safely handle missing dates and extract only the date part (YYYY-MM-DD or DD-MM-YYYY)
      const rawDate = b.date ? String(b.date).trim().substring(0, 10) : "";
      const bDate = /^\d{2}-\d{2}-\d{4}$/.test(rawDate) 
        ? rawDate.split("-").reverse().join("-") 
        : rawDate;

      if (start && end) {
        matchesDate = bDate >= start && bDate <= end;
      } else if (start) {
        matchesDate = bDate >= start;
      } else if (end) {
        matchesDate = bDate <= end;
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

  const assignTableToBooking = useCallback(async (booking, tableNo) => {
    try {
      await updateDoc(doc(db, "bookings", booking.id), {
        tableNo: tableNo,
      });
      await addLog("assign_table", `${lang === "ar" ? "تسكين" : "Seated"} ${booking.name} (${lang === "ar" ? "غرفة" : "Room"} ${booking.room}) ${lang === "ar" ? "على طاولة" : "at table"} ${tableNo}`);
      showToast(lang === "ar" ? "تم تسكين الضيف في الطاولة بنجاح! 🪑" : "Guest assigned to table successfully! 🪑");
    } catch (err) {
      console.error("Error assigning table:", err);
      showToast(lang === "ar" ? "فشل تحديد الطاولة" : "Failed to assign table");
    }
  }, [db, lang, showToast, addLog]);

  const unassignTable = useCallback(async (booking) => {
    try {
      await updateDoc(doc(db, "bookings", booking.id), {
        tableNo: "",
      });
      await addLog("unassign_table", `${lang === "ar" ? "إلغاء تسكين" : "Unseated"} ${booking.name} (${lang === "ar" ? "غرفة" : "Room"} ${booking.room})`);
      showToast(lang === "ar" ? "تم تحرير الطاولة!" : "Table unassigned successfully!");
    } catch (err) {
      console.error("Error unassigning table:", err);
      showToast(lang === "ar" ? "فشل إلغاء تعيين الطاولة" : "Failed to unassign table");
    }
  }, [db, lang, showToast, addLog]);

  const handleDeleteBooking = useCallback(async (booking) => {
    if (!window.confirm(lang === "ar" ? "هل أنت متأكد من حذف هذا الحجز؟" : "Are you sure you want to delete this booking?")) return;
    try {
      await deleteDoc(doc(db, "bookings", booking.id.toString()));
      await addLog("delete_booking", `${lang === "ar" ? "حذف حجز" : "Deleted booking for"} ${booking.name} (${lang === "ar" ? "غرفة" : "Room"} ${booking.room})`);
      showToast(lang === "ar" ? "تم حذف الحجز بنجاح" : "Booking deleted successfully");
    } catch (err) {
      console.error("Error deleting booking:", err);
      showToast(lang === "ar" ? "فشل حذف الحجز" : "Failed to delete booking");
    }
  }, [db, lang, showToast, addLog]);

  const completeBookingFromMap = useCallback(async (bookingId) => {
    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: "completed",
        updatedAt: serverTimestamp(),
      });
      const booking = bookings.find(b => b.id.toString() === bookingId.toString());
      await addLog("complete_booking", `${lang === "ar" ? "إكمال حجز" : "Completed booking for"} ${booking?.name || bookingId} (${lang === "ar" ? "غرفة" : "Room"} ${booking?.room || "N/A"})`);
      showToast(lang === "ar" ? "تم إنهاء الحجز وتحرير الطاولة بنجاح! ✅" : "Booking marked as completed and table freed! ✅");
    } catch (err) {
      console.error("Error completing booking:", err);
      showToast(lang === "ar" ? "فشل إنهاء الحجز" : "Failed to complete booking");
    }
  }, [db, lang, showToast, addLog, bookings]);

  const saveWalkInBooking = useCallback(async () => {
    if (!walkInName || !walkInGuests) {
      showToast(lang === "ar" ? "يرجى ملء الاسم وعدد الضيوف" : "Please fill Name and Guests count");
      return;
    }
    try {
      const newRef = doc(collection(db, "bookings"));
      await setDoc(newRef, {
        id: Date.now(),
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
        createdAtTime: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      });
      await addLog("add_walkin", `${lang === "ar" ? "إضافة حجز مباشر" : "Added walk-in booking for"} ${walkInName} (${lang === "ar" ? "غرفة" : "Room"} ${walkInRoom || "Walk-In"})`);
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
    addLog,
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
      await addLog("send_reminder", `${lang === "ar" ? "إرسال تذكير" : "Sent reminder to"} ${booking.name} (${lang === "ar" ? "غرفة" : "Room"} ${booking.room})`);

      showToast(lang === "ar" ? "🔔 تم تسجيل تذكير النزيل وإرسال الرسالة!" : "🔔 Reminder sent and registered successfully!");
    } catch (err) {
      console.error("Error sending reminder:", err);
      showToast(lang === "ar" ? "فشل تحديث حالة التذكير" : "Failed to update reminder status");
    }
  }, [db, lang, showToast, addLog]);

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
                    ${(booking.createdAtTime || (!isNaN(Number(booking.id)) && Number(booking.id) > 1000000000000)) ? `
                    <div class="info-row">
                      <span>${lang === "ar" ? "وقت تسجيل الحجز:" : "Booking Recorded At:"}</span>
                      <strong>${booking.createdAtTime || new Date(Number(booking.id)).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}</strong>
                    </div>
                    ` : ""}
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
                        <td>
                          ${b.time}
                          ${(b.createdAtTime || (!isNaN(Number(b.id)) && Number(b.id) > 1000000000000)) ? `
                            <div style="font-size: 9px; color: #666; margin-top: 3px; font-weight: bold; background: #f5f5f5; padding: 2px 4px; border-radius: 4px; display: block; width: max-content;">
                              ${lang === "ar" ? "أُنشئ:" : "Created:"} ${b.createdAtTime || new Date(Number(b.id)).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
                            </div>
                          ` : ""}
                        </td>
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
    const blob = new Blob([`\ufeff${csvContent}`], {
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
          lang={lang}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-16 px-4 animate-fade-in">
      {editingBooking && (
        <OrderEditorModal
          booking={editingBooking}
          onClose={() => setEditingBooking(null)}
          lang={lang}
          currentUser={currentUser}
          db={db}
          updateDoc={updateDoc}
          doc={doc}
          serverTimestamp={serverTimestamp}
          showToast={showToast}
          MENU_ITEMS={MENU_ITEMS}
          t={t}
          addLog={addLog}
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
                  {currentUser?.name || adminUser || "Admin"}
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
                    : adminRole === "manager"
                      ? (lang === "ar" ? "مدير" : "Manager")
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
                onClick={async () => {
                  // 1. Clear local state and storage immediately
                  setIsAdminAuth(false);
                  setAdminPass("");
                  setAdminRole(null);
                  setCurrentUser(null);
                  localStorage.removeItem("morenoAdminAuth");
                  localStorage.removeItem("morenoAdminRole");
                  localStorage.removeItem("morenoCurrentUser");
                  
                  // 2. Perform Firebase sign out and reload the page to clear all active listeners
                  auth.signOut().finally(() => {
                    window.location.reload();
                  });
                }}
                className="px-8 py-3 bg-red-50 text-red-500 rounded-2xl font-black text-sm hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100 flex items-center gap-2 cursor-pointer"
              >
                <XCircle size={18} />
                {t.logout}
              </button>
            </div>
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
        </div>        <WaitlistManagerPanel
          lang={lang}
          waitlistBookings={waitlistBookings}
          settings={settings}
          getOccupancy={getOccupancy}
          currentUser={currentUser}
          db={db}
          showToast={showToast}
          findAvailableTable={findAvailableTable}
          updateDoc={updateDoc}
          doc={doc}
          serverTimestamp={serverTimestamp}
        />


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
                      {b.editHistory && b.editHistory.length > 0 && (
                        <div className="mt-2 space-y-1 bg-stone-50/80 p-2.5 rounded-xl border border-stone-200/60 text-[9px] text-stone-500 max-w-xs no-print leading-relaxed">
                          <p className="font-black text-brand-orange uppercase tracking-wider text-[8px] mb-1">
                            {lang === "ar" ? "📜 سجل التعديلات:" : "📜 Edit History:"}
                          </p>
                          {b.editHistory.map((h, i) => (
                            <div key={i} className="border-b border-stone-200/50 pb-1 last:border-0 last:pb-0 font-bold">
                              <span className="text-brand-blue">{h.changedBy}</span> 
                              <span className="text-[8px] text-stone-400 mx-1">({h.changedAt})</span>:{" "}
                              <span className="text-stone-600 font-semibold">{h.changes}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-6 font-bold text-stone-600">
                      <span className="text-brand-blue block text-sm mb-1">
                        {b.restaurant}
                      </span>
                      <div className="flex flex-col gap-1">
                        <div>{b.date}</div>
                        <div className="text-brand-orange text-sm font-black">{b.time}</div>
                        {(b.createdAtTime || (!isNaN(Number(b.id)) && Number(b.id) > 1000000000000)) && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-stone-400 font-bold mt-1 bg-stone-100 px-2 py-0.5 rounded-md w-fit no-print">
                            <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-pulse"></span>
                            {lang === "ar" ? "أُنشئ:" : "Created:"}{" "}
                            {b.createdAtTime ||
                              new Date(Number(b.id)).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}
                          </span>
                        )}
                      </div>
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
                      {(b.status === "confirmed" || b.status === "completed") && (
                        <div className="mt-2.5 no-print flex flex-col items-center">
                          <button
                            onClick={async () => {
                              try {
                                const newDelivered = !b.orderDelivered;
                                await updateDoc(
                                  doc(db, "bookings", b.id.toString()),
                                  {
                                    orderDelivered: newDelivered,
                                    orderDeliveredBy: currentUser?.name || currentUser?.username || "F&B Staff",
                                    orderDeliveredAt: serverTimestamp(),
                                  }
                                );
                                await addLog("toggle_delivery", `${lang === "ar" ? "تغيير حالة تسليم الطلب" : "Toggled order delivery for"} ${b.name} (${lang === "ar" ? "غرفة" : "Room"} ${b.room}) - ${newDelivered ? (lang === "ar" ? "تم التسليم" : "Delivered") : (lang === "ar" ? "لم يتم التسليم" : "Not Delivered")}`);
                                showToast(
                                  lang === "ar"
                                    ? `تم تحديث حالة استلام الطلب: ${newDelivered ? "تم الاستلام" : "لم يتم الاستلام"}`
                                    : `Updated order delivery: ${newDelivered ? "Delivered" : "Not Delivered"}`
                                );
                              } catch (err) {
                                console.error("Error toggling delivery:", err);
                              }
                            }}
                            className={`px-2 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 border transition-all cursor-pointer transform active:scale-95 ${
                              b.orderDelivered
                                ? "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
                                : "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
                            }`}
                          >
                            <span>{b.orderDelivered ? "🍽️ " + (lang === "ar" ? "تم الاستلام" : "Delivered") : "⏳ " + (lang === "ar" ? "لم يستلم بعد" : "Pending Delivery")}</span>
                          </button>
                          {b.orderDelivered && b.orderDeliveredBy && (
                            <span className="text-[8px] text-stone-400 font-bold mt-1 text-center block">
                              {lang === "ar" ? "بواسطة:" : "By:"} {b.orderDeliveredBy}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-6">
                      <div className="flex gap-2">
                        {b.status === "pending" && !isReadOnlyUser && (
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
                                await addLog("confirm_booking", `${lang === "ar" ? "تأكيد حجز" : "Confirmed booking for"} ${b.name} (${lang === "ar" ? "غرفة" : "Room"} ${b.room})`);
                              }}
                              className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 font-bold shadow-sm transition-all text-sm flex items-center gap-1"
                            >
                              <CheckCircle size={16} /> {t.confirm}
                            </button>
                            <button
                              onClick={async () => {
                                await updateDoc(
                                  doc(db, "bookings", b.id.toString()),
                                  {
                                    status: "cancelled",
                                    updatedBy: currentUser.name,
                                    updatedAt: serverTimestamp(),
                                  },
                                );
                                await addLog("cancel_booking", `${lang === "ar" ? "إلغاء حجز" : "Cancelled booking for"} ${b.name} (${lang === "ar" ? "غرفة" : "Room"} ${b.room})`);
                              }}
                              className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 font-bold shadow-sm transition-all text-sm flex items-center gap-1"
                            >
                              <XCircle size={16} /> {t.cancel}
                            </button>
                          </>
                        )}
                        {b.status === "confirmed" && !isReadOnlyUser && (
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
                                await addLog("complete_booking", `${lang === "ar" ? "إكمال حجز" : "Completed booking for"} ${b.name} (${lang === "ar" ? "غرفة" : "Room"} ${b.room})`);
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
                        {b.status === "waitlist" && !isReadOnlyUser && (
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
                                await addLog("confirm_booking", `${lang === "ar" ? "تأكيد حجز من قائمة الانتظار" : "Confirmed booking from waitlist for"} ${b.name} (${lang === "ar" ? "غرفة" : "Room"} ${b.room})`);
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

                        {/* Edit Button for Manager/Admin/Staff */}
                        {(isSuperAdmin || adminRole === "main" || adminRole === "manager" || adminRole === "staff" || isGrUser) && !isReadOnlyUser && (
                          <button
                            onClick={() => setEditingBooking(b)}
                            className="bg-brand-orange/10 text-brand-orange px-3 py-2 rounded-xl hover:bg-brand-orange/20 font-bold shadow-sm transition-all text-sm flex items-center gap-1"
                          >
                            <Edit size={16} />
                          </button>
                        )}

                        {!isReadOnlyUser && (
                          <button
                            onClick={() => handleDeleteBooking(b)}
                            className="text-stone-300 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-colors ml-auto"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
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

        {/* 
        <TableMapPanel
          lang={lang}
          selectedMapRes={selectedMapRes}
          ITALIAN_TABLES={ITALIAN_TABLES}
          ORIENTAL_TABLES={ORIENTAL_TABLES}
          bookingsByTable={bookingsByTable}
          setSelectedMapRes={setSelectedMapRes}
          setSelectedMapTable={setSelectedMapTable}
          setMovingBooking={setMovingBooking}
          settings={settings}
          selectedMapTime={selectedMapTime}
          setSelectedMapTime={setSelectedMapTime}
          t={t}
          movingBooking={movingBooking}
          selectedMapTable={selectedMapTable}
          waitlistBookings={waitlistBookings}
          unassignedBookings={unassignedBookings}
          assignTableToBooking={assignTableToBooking}
          completeBookingFromMap={completeBookingFromMap}
          unassignTable={unassignTable}
          printReceipt={printReceipt}
          setWalkInGuests={setWalkInGuests}
          setShowWalkInModal={setShowWalkInModal}
          adminStartDate={adminStartDate}
          todayStr={todayStr}
        />
        */}

        <ReminderCenterPanel
          lang={lang}
          notificationPermission={notificationPermission}
          requestNotificationPermission={requestNotificationPermission}
          upcomingReminders={upcomingReminders}
          getBookingStartMs={getBookingStartMs}
          sendReminder={sendReminder}
        />







        {/* Administrative & Analytics Panels */}
        {(isSuperAdmin || adminRole === "main" || adminRole === "manager" || isReadOnlyUser) && (
          <div className="space-y-8 animate-fade-in mt-12">
            <AnalyticsDashboard bookings={bookings} t={t} lang={lang} />
            
            {!isReadOnlyUser && (
              <>
                {(isSuperAdmin || adminRole === "main") && (
                  <CustomerDatabasePanel bookings={bookings} t={t} />
                )}
                
                <FeedbackPanel db={db} t={t} lang={lang} showToast={showToast} />

                <SettingsPanel
                  settings={settings}
                  t={t}
                  onSave={updateSettingsInDB}
                  isSuperAdmin={isSuperAdmin}
                  lang={lang}
                />

                {isSuperAdmin && (
                  <UsersPanel users={users} t={t} db={db} showToast={showToast} lang={lang} addLog={addLog} fetchUsers={fetchUsers} />
                )}

                <BlacklistPanel
                  blacklist={blacklist}
                  t={t}
                  db={db}
                  showToast={showToast}
                  currentUser={currentUser}
                  lang={lang}
                />

                {isSuperAdmin && (
                  <LogsPanel logs={logs} t={t} lang={lang} />
                )}
              </>
            )}
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