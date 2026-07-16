import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
  lazy,
  useRef,
} from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
} from "firebase/firestore";
import {
  Check,
  MessageCircle,
  Clock,
  Smartphone,
  X,
} from "lucide-react";

// Firebase Instance
import { db, auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

// Externalized Data and Translations
import { translations } from "./translations";
import { MENU_ITEMS } from "./data";

// Core Components (Always loaded)
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import CartSidebar from "./components/CartSidebar";
import SparklesBackground from "./components/SparklesBackground";
// import OtpModal from "./components/OtpModal"; // Deferred for now

// Lazy Loaded Views (Loaded on demand to improve performance)
const BookingView = lazy(() => import("./components/BookingView"));
const AdminView = lazy(() => import("./components/AdminView"));
const MenuView = lazy(() => import("./components/MenuView"));
const TrackView = lazy(() => import("./components/TrackView"));
const SuccessView = lazy(() => import("./components/SuccessView"));
const FeedbackView = lazy(() => import("./components/FeedbackView"));

import { SkeletonPage, SkeletonMenu } from "./components/SkeletonLoader";

// Suspense Fallback Loader
const FallbackLoader = ({ view }) => {
  if (view === "menu") return <SkeletonMenu />;
  return <SkeletonPage />;
};

// Helper for Local Date YYYY-MM-DD — defined OUTSIDE component so it
// is never recreated on re-renders
const getLocalDate = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().split("T")[0];
};

const pwaTranslations = {
  ar: {
    title: "تثبيت تطبيق Moreno Horizon",
    desc: "قم بتثبيت التطبيق على شاشتك الرئيسية للوصول السريع ومتابعة حجوزاتك بشكل أسرع وأسهل!",
    btnInstall: "تثبيت الآن",
    btnDismiss: "ليس الآن"
  },
  en: {
    title: "Install Moreno Horizon",
    desc: "Install our luxury booking app on your home screen for instant access & real-time updates!",
    btnInstall: "Install Now",
    btnDismiss: "Not Now"
  },
  it: {
    title: "Installa l'app Moreno Horizon",
    desc: "Installa la nostra app sulla schermata iniziale per prenotazioni immediate e aggiornamenti!",
    btnInstall: "Installa Ora",
    btnDismiss: "Non Ora"
  },
  de: {
    title: "Moreno Horizon App installieren",
    desc: "Installieren Sie unsere App für schnellen Zugriff und ein nahtloses Reservierungserlebnis!",
    btnInstall: "Jetzt installieren",
    btnDismiss: "Nicht jetzt"
  },
  ru: {
    title: "Установить приложение Moreno Horizon",
    desc: "Установите приложение на главный экран для быстрого доступа и удобного бронирования столов!",
    btnInstall: "Установить",
    btnDismiss: "Не сейчас"
  },
  fr: {
    title: "Installer l'app Moreno Horizon",
    desc: "Installez l'application sur votre écran d'accueil pour un accès rapide et des réservations fluides !",
    btnInstall: "Installer",
    btnDismiss: "Pas maintenant"
  },
  pl: {
    title: "Zainstaluj aplikację Moreno Horizon",
    desc: "Zainstaluj aplikację na ekranie głównym, aby uzyskać szybki dostęp i bezproblemową rezerwację!",
    btnInstall: "Zainstaluj",
    btnDismiss: "Nie teraz"
  }
};

const LOCAL_APP_VERSION = "2026.05.11.2";

const updateTranslations = {
  ar: {
    title: "تحديث جديد متوفر!",
    desc: "تم إطلاق نسخة جديدة ومحسنة من التطبيق لتجربة أسرع وأكثر سلاسة. جاري تطبيق التحديث تلقائياً...",
    btnUpdate: "تحديث الآن",
    loading: "جاري التحديث..."
  },
  en: {
    title: "New Update Available!",
    desc: "A new and improved version of the app has been released. Applying the update automatically...",
    btnUpdate: "Update Now",
    loading: "Updating..."
  },
  it: {
    title: "Nuovo aggiornamento disponibile!",
    desc: "È stata rilasciata una nuova versione migliorata dell'app. Applicazione dell'aggiornamento...",
    btnUpdate: "Aggiorna ora",
    loading: "Aggiornamento..."
  },
  de: {
    title: "Neues Update verfügbar!",
    desc: "Eine neue und verbesserte Version der App wurde veröffentlicht. Update wird automatisch angewendet...",
    btnUpdate: "Jetzt aktualisieren",
    loading: "Wird aktualisiert..."
  },
  ru: {
    title: "Доступно новое обновление!",
    desc: "Выпущена новая улучшенная версия приложения. Обновление применяется автоматически...",
    btnUpdate: "Обновить сейчас",
    loading: "Обновление..."
  },
  fr: {
    title: "Nouvelle mise à jour disponible !",
    desc: "Une nouvelle version améliorée de l'application est disponible. Application de la mise à jour...",
    btnUpdate: "Mettre à jour",
    loading: "Mise à jour..."
  },
  pl: {
    title: "Dostępna nowa aktualizacja!",
    desc: "Wydano nową, ulepszoną wersję aplikacji. Aktualizacja jest stosowana automatycznie...",
    btnUpdate: "Aktualizuj teraz",
    loading: "Aktualizowanie..."
  }
};

export default function App() {
  // Computed once per mount — date doesn't change during a session
  const todayStr = useMemo(() => getLocalDate(), []);

  const [settings, setSettings] = useState({
    adminPass: "",
    shift1: "18:30 - 19:30",
    shift2: "20:00 - 21:00",
    shiftOri: "19:00 - 20:00",
    capacityItalian: 80,
    capacityOriental: 30,
    shiftLimitItalian: 40,
    isClosedItalian: false,
    isClosedOriental: false,
  });

  const [lang, setLang] = useState(
    () => localStorage.getItem("prefLang") || "ar",
  );
  const t = useMemo(() => {
    if (!translations) return {};
    return {
      ...(translations["en"] || {}),
      ...(translations[lang] || {}),
    };
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("prefLang", lang);
    document.documentElement.lang = lang;
    if (t.dir) document.documentElement.dir = t.dir;
    document.title = `${t.brand || "Moreno Horizon"} - Spa & Resort`;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && t.heroSub) {
      metaDesc.setAttribute("content", t.heroSub);
    }
  }, [lang, t]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [view, setView] = useState(() => {
    return localStorage.getItem("morenoLastView") || "home";
  });
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("morenoCart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [toast, setToast] = useState(null);
  const [bookingData, setBookingData] = useState(() => {
    try {
      const saved = localStorage.getItem("morenoBookingData");
      if (saved) {
        const parsed = JSON.parse(saved);
        const today = new Date();
        const isThursday = today.getDay() === 4;
        if (isThursday && parsed.restaurant === "oriental") {
          return {
            ...parsed,
            date: getLocalDate(),
            restaurant: "",
            time: "",
          };
        }
        return { ...parsed, date: getLocalDate() };
      }
    } catch (e) {
      console.error(e);
    }
    return {
      name: "",
      phone: "+20",
      room: "",
      date: getLocalDate(),
      time: "",
      guests: "",
      restaurant: "",
      notes: "",
    };
  });
  const [activeRestaurantMenu, setActiveRestaurantMenu] = useState(() => {
    try {
      const saved = localStorage.getItem("morenoBookingData");
      if (saved) {
        const parsed = JSON.parse(saved);
        const today = new Date();
        const isThursday = today.getDay() === 4;
        if (isThursday && parsed.restaurant === "oriental") {
          return "italian";
        }
        if (parsed.restaurant) {
          return parsed.restaurant;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return "italian";
  });
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true",
  );
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPwaBanner, setShowPwaBanner] = useState(false);

  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleApplyUpdate = useCallback(() => {
    setIsUpdating(true);
    if (settings && settings.appVersion) {
      localStorage.setItem("lastReloadAttemptVersion", settings.appVersion);
    }
    if ("caches" in window) {
      caches.keys().then((names) => {
        Promise.all(names.map(name => caches.delete(name))).finally(() => {
          window.location.reload(true);
        });
      }).catch(() => {
        window.location.reload(true);
      });
    } else {
      window.location.reload(true);
    }
  }, [settings]);

  useEffect(() => {
    if (settings && settings.appVersion) {
      const dbVersion = settings.appVersion;
      if (dbVersion !== LOCAL_APP_VERSION) {
        const lastAttempted = localStorage.getItem("lastReloadAttemptVersion");
        if (lastAttempted !== dbVersion) {
          setShowUpdatePrompt(true);
        }
      }
    }
  }, [settings]);

  useEffect(() => {
    if (showUpdatePrompt) {
      setIsUpdating(true);
      const timer = setTimeout(() => {
        handleApplyUpdate();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [showUpdatePrompt, handleApplyUpdate]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const isDismissed = sessionStorage.getItem("morenoPwaDismissed");
      if (!isDismissed) {
        setShowPwaBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
  }, []);

  const handlePwaInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA install outcome: ${outcome}`);
    setDeferredPrompt(null);
    setShowPwaBanner(false);
  };

  const handlePwaDismiss = () => {
    sessionStorage.setItem("morenoPwaDismissed", "true");
    setShowPwaBanner(false);
  };

  /* Deferred for now:
  const [otpState, setOtpState] = useState({
    show: false,
    phone: "",
    correctCode: "", // Used in sandbox mode
    loading: false,
    error: "",
    confirmationResult: null,
  });
  const recaptchaVerifierRef = useRef(null);
  */

  // --- Back Button & History Support ---
  useEffect(() => {
    // Initial state setup
    if (!window.history.state) {
      window.history.replaceState({ view: "home" }, "");
    }

    // Support landing directly via URL query parameters (e.g. ?view=feedback)
    const params = new URLSearchParams(window.location.search);
    const urlView = params.get("view");
    if (urlView === "feedback") {
      setView("feedback");
    }

    const handlePopState = (event) => {
      // Always close overlays on back button
      setIsSidebarOpen(false);
      setIsLangOpen(false);
      setIsMenuOpen(false);
      setIsCartOpen(false);

      if (event.state && event.state.view) {
        setView(event.state.view);
      } else {
        setView("home");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Push to history when view changes manually
  useEffect(() => {
    localStorage.setItem("morenoLastView", view);
    if (window.history.state?.view !== view) {
      window.history.pushState({ view }, "");
    }
    window.scrollTo(0, 0);
  }, [view]);

  // Persist bookingData
  useEffect(() => {
    localStorage.setItem("morenoBookingData", JSON.stringify(bookingData));
  }, [bookingData]);

  // Scroll Progress Logic
  useEffect(() => {
    const handleScroll = () => {
      const winScroll =
        document.body.scrollTop || document.documentElement.scrollTop;
      const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      const progress = document.getElementById("scroll-progress");
      if (progress) progress.style.width = scrolled + "%";
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Optional: Allow back button to close modals
  useEffect(() => {
    const isAnyModalOpen =
      isSidebarOpen || isLangOpen || isMenuOpen || isCartOpen;
    if (isAnyModalOpen && !window.history.state?.isModal) {
      window.history.pushState({ view, isModal: true }, "");
    }
  }, [isSidebarOpen, isLangOpen, isMenuOpen, isCartOpen, view]);

  const playSound = useCallback((type) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      if (type === "add") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === "success") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.setValueAtTime(800, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      // Ignore audio playback errors
    }
  }, []);

  // Admin Auth check for notifications is now read from localStorage directly when needed.

  const showToast = useCallback((msg, duration = 3000) => {
    setToast(msg);
    setTimeout(() => setToast(null), duration);
  }, []);

  const triggerBrowserNotification = useCallback((booking) => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const title = lang === "ar" ? "🔔 حجز جديد وارد!" : "🔔 New Booking Received!";
    const body = lang === "ar"
      ? `النزيل: ${booking.name}\nالمطعم: ${booking.restaurant === "italian" ? "الإيطالي" : "الشرقي"}\nالغرفة: ${booking.room} | الأفراد: ${booking.guests}`
      : `Guest: ${booking.name}\nRestaurant: ${booking.restaurant === "italian" ? "Italian" : "Oriental"}\nRoom: ${booking.room} | Guests: ${booking.guests}`;

    const options = {
      body,
      icon: "/logo.webp",
      badge: "/logo.webp",
      vibrate: [200, 100, 200],
      tag: "new-booking",
      renotify: true,
      data: {
        url: window.location.origin + "?view=admin",
      },
    };

    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, options);
      });
    } else {
      new Notification(title, options);
    }
  }, [lang]);

  const [users, setUsers] = useState([]);
  
  const fetchUsers = useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(data);
    } catch (e) {
      console.error("Error fetching users:", e);
    }
  }, []);
  const fetchSettings = useCallback(async () => {
    try {
      const docSnap = await getDoc(doc(db, "settings", "general"));
      if (docSnap.exists()) {
        setSettings((prev) => ({ ...prev, ...docSnap.data() }));
      }
    } catch (e) {
      console.error("Error fetching settings:", e);
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      const bookingsQuery = view === "admin"
        ? query(collection(db, "bookings"))
        : query(collection(db, "bookings"), where("date", ">=", todayStr));
      
      const snapshot = await getDocs(bookingsQuery);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      data.sort((a, b) => b.id - a.id);
      setBookings(data);
    } catch (e) {
      console.error("Error fetching bookings:", e);
    }
  }, [view, todayStr]);

  const [blacklist, setBlacklist] = useState([]);
  const [showWaitlistDialog, setShowWaitlistDialog] = useState(false);
  const [bookings, setBookings] = useState([]);

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

  const lastBookingIdRef = useRef(null);

  useEffect(() => {
    let settingsLoaded = false;
    let bookingsLoaded = false;

    const checkLoading = () => {
      if (settingsLoaded && bookingsLoaded) {
        setIsLoading(false);
      }
    };

    // Fallback: Force stop loading after 2.5 seconds to ensure UX isn't blocked
    const fallbackTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    fetchSettings();
    settingsLoaded = true;
    checkLoading();

    fetchBookings();
    bookingsLoaded = true;
    checkLoading();

    if (view === "admin") {
      fetchUsers();
      

      
      const fetchBlacklist = async () => {
        try {
          const snapshot = await getDocs(collection(db, "blacklist"));
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setBlacklist(data);
        } catch (e) {
          console.error("Error fetching blacklist:", e);
        }
      };
      fetchBlacklist();
    }

    return () => {
      clearTimeout(fallbackTimer);
    };
  }, [todayStr, playSound, showToast, view, user]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view]);

  useEffect(() => {
    localStorage.setItem("morenoCart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    document.documentElement.dir = t.dir;
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [isDarkMode]);

  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      setBookingData((prevData) => {
        // Thursday Rule for Oriental
        if (name === "restaurant" && value === "oriental") {
          const selectedDate = new Date(prevData.date);
          if (selectedDate.getDay() === 4) {
            showToast(t.orientalThursdayMsg, 10000);
            return prevData;
          }
        }

        if (name === "date") {
          const selectedDate = new Date(value);
          if (
            selectedDate.getDay() === 4 &&
            prevData.restaurant === "oriental"
          ) {
            showToast(t.orientalThursdayMsg, 10000);
            setActiveRestaurantMenu("italian");
            return {
              ...prevData,
              date: value,
              restaurant: "",
              time: "",
            };
          }
        }

        if (name === "room") {
          const numericValue = value.replace(/\D/g, "");
          if (numericValue.length <= 4) {
            return { ...prevData, room: numericValue };
          }
          return prevData;
        }

        if (name === "restaurant") {
          setActiveRestaurantMenu(value);

          if (value === "oriental") {
            const allItems = MENU_ITEMS.find((i) => i.id === 1);
            if (allItems) {
              setCart([{ ...allItems, qty: Number(prevData.guests || 1) }]);
            }
          } else {
            setCart([]); // Clear cart if switching back to Italian
          }
          return { ...prevData, restaurant: value, time: "" };
        } else if (name === "guests") {
          const guestsVal = Number(value);

          // Sync Oriental 'All Items' qty with pax count
          if (prevData.restaurant === "oriental") {
            setCart((prevCart) => {
              const hasAllItems = prevCart.some((i) => i.id === 1);
              if (hasAllItems) {
                return prevCart.map((i) =>
                  i.id === 1 ? { ...i, qty: guestsVal } : i,
                );
              } else {
                const allItems = MENU_ITEMS.find((i) => i.id === 1);
                return allItems ? [{ ...allItems, qty: guestsVal }] : prevCart;
              }
            });
          }
          return { ...prevData, guests: value };
        } else {
          return { ...prevData, [name]: value };
        }
      });
    },
    [t, showToast],
  );


  const findAvailableTable = useCallback((date, restaurantId, time, guestsCount) => {
    const requestedGuests = Number(guestsCount || 1);
    const tablesList = [];
    
    if (restaurantId === "italian") {
      const count = settings.tablesCountItalian !== undefined && settings.tablesCountItalian !== "" ? Number(settings.tablesCountItalian) : 12;
      const indoorCount = Math.ceil(count * 0.6);
      const vipCount = Math.ceil(count * 0.2);

      for (let i = 1; i <= count; i++) {
        let seats = 2;

        if (i <= indoorCount) {
          if (i % 3 === 0) {
            seats = 6;
          } else if (i % 2 === 0) {
            seats = 4;
          } else {
            seats = 2;
          }
        } else if (i <= indoorCount + vipCount) {
          seats = i % 2 === 0 ? 8 : 6;
        } else {
          seats = i % 2 === 0 ? 4 : 2;
        }
        tablesList.push({ name: i.toString(), seats });
      }
    } else if (restaurantId === "oriental") {
      const count = settings.tablesCountOriental !== undefined && settings.tablesCountOriental !== "" ? Number(settings.tablesCountOriental) : 8;
      const indoorCount = Math.ceil(count * 0.6);
      const vipCount = Math.ceil(count * 0.2);

      for (let i = 1; i <= count; i++) {
        let seats = 4;

        if (i <= indoorCount) {
          if (i % 3 === 0) {
            seats = 6;
          } else if (i % 2 === 0) {
            seats = 4;
          } else {
            seats = 4;
          }
        } else if (i <= indoorCount + vipCount) {
          seats = i % 2 === 0 ? 8 : 6;
        } else {
          seats = 4;
        }
        tablesList.push({ name: (20 + i).toString(), seats });
      }
    }

    if (tablesList.length === 0) return "";

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
  }, [bookings, settings]);

  const submitBooking = useCallback(
    async (eOrStatus) => {
      if (eOrStatus && eOrStatus.preventDefault) eOrStatus.preventDefault();
      const overrideStatus = typeof eOrStatus === "string" ? eOrStatus : null;

      if (cart.length === 0) {
        showToast(
          t.selectItemsFirst || "يرجى اختيار أصناف من المنيو أولاً قبل الحجز",
          4000,
        );
        return;
      }

      if (
        !bookingData.name ||
        !bookingData.phone ||
        !bookingData.room ||
        !bookingData.date ||
        !bookingData.time ||
        !bookingData.restaurant ||
        !bookingData.guests
      ) {
        showToast(t.incompleteBooking);
        return;
      }

      // Name Validation
      if (bookingData.name.trim().length < 3) {
        showToast(t.nameTooShort || "الاسم يجب أن يكون 3 أحرف على الأقل");
        return;
      }

      // Room Validation
      if (bookingData.room.length !== 4) {
        showToast(t.roomNumberError);
        return;
      }

      // Phone Validation (ensure something added after prefix)
      const phoneSuffix = bookingData.phone.replace("+20", "").trim();
      if (phoneSuffix.length < 8) {
        showToast(t.phoneError || "رقم الهاتف غير صحيح");
        return;
      }

      // Guests Validation
      if (parseInt(bookingData.guests) <= 0) {
        showToast(t.guestsError || "يجب اختيار فرد واحد على الأقل");
        return;
      }

      const rest = bookingData.restaurant;
      const requestedGuests = Number(bookingData.guests || 1);

      // Blacklist check
      const isBlacklisted = blacklist.some((item) => {
        if (item.status === "unbanned") return false;
        const isMatch =
          item.value === bookingData.phone || item.value === bookingData.room;
        if (!isMatch) return false;

        // If there is an expiry date, the ban is active up to and including that date
        if (item.expiryDate) {
          return bookingData.date <= item.expiryDate;
        }

        // No expiry means permanent ban
        return true;
      });
      if (isBlacklisted) {
        showToast(t.blacklistedMsg, 6000);
        return;
      }

      if (rest === "italian") {
        if (settings.isClosedItalian) {
          showToast(t.restaurantClosedMsg, 5000);
          return;
        }
        const dailyItal = getOccupancy(bookingData.date, "italian");
        const shiftItal = getOccupancy(
          bookingData.date,
          "italian",
          bookingData.time,
        );

        if (
          dailyItal + requestedGuests > (settings.capacityItalian || 80) ||
          shiftItal + requestedGuests > (settings.shiftLimitItalian || 40)
        ) {
          setShowWaitlistDialog(true);
          return;
        }
      } else if (rest === "oriental") {
        if (settings.isClosedOriental) {
          showToast(t.restaurantClosedMsg, 5000);
          return;
        }
        const dailyOri = getOccupancy(bookingData.date, "oriental");

        if (dailyOri + requestedGuests > (settings.capacityOriental || 30)) {
          setShowWaitlistDialog(true);
          return;
        }
      }

      // Weekly Limit Validation based on Phone Number
      // Weekly Limit Validation based on Phone Number or Room
      const requestedDate = new Date(bookingData.date);
      const hasRecentBooking = bookings.some((b) => {
        if (b.status !== "cancelled" && b.resId === bookingData.restaurant) {
          const samePhone = b.phone === bookingData.phone;
          const sameRoom = b.room === bookingData.room;

          if (samePhone || sameRoom) {
            const existingDate = new Date(b.date);
            const diffTime = Math.abs(requestedDate - existingDate);
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            return diffDays < 7;
          }
        }
        return false;
      });

      if (hasRecentBooking) {
        showToast(t.weeklyLimitMsg, 6000);
        return;
      }

      // SMS OTP Verification Interception (Deferred)
      /*
      if (settings.enableSMSVerification && !isOtpVerified) {
        triggerSmsVerification(overrideStatus);
        return;
      }
      */

      let orderDetails = t.noFoodOrders;
      let engOrderDetails = "No Food Orders";
      if (cart.length > 0) {
        orderDetails = cart
          .map((item) => `- ${item.qty}x ${item.name[lang] || item.name["en"]}`)
          .join("\n");
        engOrderDetails = cart
          .map(
            (item) =>
              `- ${item.qty}x ${item.name["en"] || item.name["ar"] || item.name}`,
          )
          .join("\n");
      }

      const resName =
        bookingData.restaurant === "italian" ? t.italian : t.oriental;

      // Auto-assign table if status is not waitlist
      let assignedTableNo = "";
      if (overrideStatus !== "waitlist") {
        assignedTableNo = findAvailableTable(
          bookingData.date,
          bookingData.restaurant,
          bookingData.time,
          bookingData.guests
        );
      }

      // Save to Admin Dashboard Locally
      const newBooking = {
        id: Date.now(),
        name: bookingData.name,
        phone: bookingData.phone,
        room: bookingData.room,
        date: bookingData.date,
        time: bookingData.time,
        restaurant: resName,
        resId: bookingData.restaurant,
        guests: bookingData.guests || "2",
        status: overrideStatus || "pending",
        tableNo: assignedTableNo,
        orderDetails: orderDetails,
        engOrderDetails: engOrderDetails,
        notes: bookingData.notes || "",
        total: 0,
        items: cart,
        createdAtTime: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      };

      try {
        await setDoc(doc(db, "bookings", newBooking.id.toString()), newBooking);
        if (overrideStatus === "waitlist") {
          showToast(t.waitlistSuccess, 5000);
        } else {
          showToast(t.reservationConfirmed + " " + newBooking.id, 5000);
        }
        setCart([]);
        setBookingData({
          name: "",
          phone: "+20",
          room: "",
          date: getLocalDate(),
          time: "",
          guests: "",
          restaurant: "",
        });
      } catch (e) {
        console.error("Firebase Error:", e);
      }

      // Send to Google Sheets (Master Database)
      const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
      showToast(t.savingReservation);

      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: JSON.stringify({
            command: "newBooking",
            booking: newBooking,
          }),
        });

        console.log("Master Sheet Sync Triggered");
      } catch (error) {
        console.error("Sheet Sync error:", error);
      } finally {
        setTimeout(() => setView("success"), 1000);
      }
    },
    [bookingData, blacklist, t, bookings, lang, cart, settings, playSound, findAvailableTable],
  );

  const addToCart = useCallback(
    (item) => {
      if (!activeRestaurantMenu) {
        showToast(t.selectRestaurantFirst);
        return;
      }

      const paxCount = parseInt(bookingData.guests) || 0;
      if (paxCount === 0) {
        showToast(t.selectPaxFirst || "يرجى تحديد عدد الأفراد أولاً");
        return;
      }

      // Special logic for Oriental 'All Items'
      if (item.restaurant === "oriental" && item.id === 1) {
        setCart([{ ...item, qty: paxCount }]);
        showToast(t.addedMsg);
        playSound("add");
        return;
      }

      const currentTotal = cart.reduce((sum, i) => sum + i.qty, 0);
      if (currentTotal >= paxCount) {
        showToast(t.paxLimitReached);
        return;
      }

      playSound("add");

      setCart((prev) => {
        const existsInDifferentRestaurant = prev.find(
          (i) => i.restaurant !== item.restaurant,
        );
        if (existsInDifferentRestaurant) {
          showToast(t.oneRestaurantOnlyMsg, 4000);
          return prev;
        }

        const existingItem = prev.find((i) => i.id === item.id);
        if (existingItem) {
          showToast(t.addedMsg);
          return prev.map((i) =>
            i.id === item.id ? { ...i, qty: i.qty + 1 } : i,
          );
        }

        showToast(t.addedMsg);
        return [...prev, { ...item, qty: 1 }];
      });
    },
    [
      t,
      activeRestaurantMenu,
      lang,
      playSound,
      bookingData.guests,
      cart,
      showToast,
    ],
  );


  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const italianTodayAvail = useMemo(() => {
    const daily = bookings
      .filter(
        (b) =>
          b.date === todayStr &&
          (b.resId === "italian" ||
            (b.restaurant && b.restaurant.toLowerCase().includes("italian"))) &&
          b.status !== "cancelled",
      )
      .reduce((sum, b) => sum + Number(b.guests || 1), 0);
    return Math.max(0, (settings.capacityItalian || 40) - daily);
  }, [bookings, todayStr, settings.capacityItalian]);

  const orientalTodayAvail = useMemo(() => {
    const daily = bookings
      .filter(
        (b) =>
          b.date === todayStr &&
          (b.resId === "oriental" ||
            (b.restaurant &&
              b.restaurant.toLowerCase().includes("oriental"))) &&
          b.status !== "cancelled",
      )
      .reduce((sum, b) => sum + Number(b.guests || 1), 0);
    return Math.max(0, (settings.capacityOriental || 25) - daily);
  }, [bookings, todayStr, settings.capacityOriental]);



  // Calculate Available Tables (Booking Logic)
  const targetDateForTables =
    view === "book" && bookingData.date ? bookingData.date : todayStr;

  const availableTablesCount = useMemo(() => {
    if (bookingData.restaurant === "italian") {
      const dailyItal = bookings
        .filter(
          (b) =>
            b.date === targetDateForTables &&
            (b.resId === "italian" ||
              (b.restaurant &&
                (b.restaurant.includes("إيطالي") ||
                  b.restaurant.includes("Italian")))) &&
            b.status !== "cancelled",
        )
        .reduce((sum, b) => sum + Number(b.guests || 1), 0);
      if (bookingData.time) {
        const shiftItal = bookings
          .filter(
            (b) =>
              b.date === targetDateForTables &&
              (b.resId === "italian" ||
                (b.restaurant &&
                  (b.restaurant.includes("إيطالي") ||
                    b.restaurant.includes("Italian")))) &&
              b.time === bookingData.time &&
              b.status !== "cancelled",
          )
          .reduce((sum, b) => sum + Number(b.guests || 1), 0);
        return Math.max(
          0,
          Math.min(
            (settings.capacityItalian || 80) - dailyItal,
            (settings.shiftLimitItalian || 40) - shiftItal,
          ),
        );
      }
      return Math.max(0, (settings.capacityItalian || 80) - dailyItal);
    } else if (bookingData.restaurant === "oriental") {
      const dailyOri = bookings
        .filter(
          (b) =>
            b.date === targetDateForTables &&
            (b.resId === "oriental" ||
              (b.restaurant &&
                (b.restaurant.includes("شرقي") ||
                  b.restaurant.includes("Oriental")))) &&
            b.status !== "cancelled",
        )
        .reduce((sum, b) => sum + Number(b.guests || 1), 0);

      return Math.max(0, (settings.capacityOriental || 30) - dailyOri);
    }
    return "-";
  }, [
    bookingData.restaurant,
    bookingData.date,
    bookingData.time,
    bookings,
    targetDateForTables,
    settings,
  ]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[1000] bg-brand-blue flex flex-col items-center justify-center p-8 overflow-hidden">
        <div id="scroll-progress"></div>
        <div className="relative mb-12 animate-float">
          <div className="absolute inset-0 bg-brand-orange blur-[80px] opacity-20 animate-pulse"></div>
          <img
            src="/logo.webp"
            alt="Moreno"
            className="w-48 md:w-64 relative z-10 drop-shadow-[0_0_30px_rgba(255,167,38,0.3)]"
            decoding="async"
          />
        </div>
        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-brand-orange rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
          <p className="text-stone-300 uppercase tracking-[0.6em] text-xs font-light animate-pulse-subtle">
            {t.loading}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col relative z-0 ${t.dir === "rtl" ? "font-cairo" : ""}`}
    >
      <div id="scroll-progress"></div>
      <SparklesBackground />

      {/* Dynamic Header */}
      <Navbar
        view={view}
        setView={setView}
        isSidebarOpen={isSidebarOpen}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        setIsCartOpen={setIsCartOpen}
        cart={cart}
        lang={lang}
        setLang={setLang}
        isLangOpen={isLangOpen}
        setIsLangOpen={setIsLangOpen}
        translations={translations}
        t={t}
      />

      {/* Cart Sidebar */}
      <CartSidebar
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        cart={cart}
        removeFromCart={removeFromCart}
        setView={setView}
        setBookingData={setBookingData}
        activeRestaurantMenu={activeRestaurantMenu}
        lang={lang}
        t={t}
      />

      {/* Waitlist Modal */}
      {showWaitlistDialog && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowWaitlistDialog(false)}
          ></div>
          <div className="relative bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-md w-full text-center animate-scale-in">
            <div className="w-20 h-20 bg-orange-100 text-brand-orange rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock size={40} />
            </div>
            <h3 className="text-2xl font-serif text-brand-blue mb-4">
              {t.joinWaitlist}
            </h3>
            <p className="text-stone-500 font-bold mb-8">{t.waitlistConfirm}</p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowWaitlistDialog(false)}
                className="flex-1 px-6 py-4 rounded-2xl font-bold text-stone-400 hover:bg-stone-50 transition-all"
              >
                {t.cancel}
              </button>
              <button
                onClick={async () => {
                  setShowWaitlistDialog(false);
                  await submitBooking("waitlist");
                }}
                className="flex-1 bg-brand-orange text-white px-6 py-4 rounded-2xl font-bold hover:bg-brand-orangeHover transition-all shadow-lg"
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] bg-stone-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-slide-down">
          <div className="bg-green-500 rounded-full p-1">
            <Check size={14} className="text-white" />
          </div>
          <span className="font-bold text-sm">{toast}</span>
        </div>
      )}

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/201000000000"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-[90] bg-green-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 hover:shadow-green-500/30 hover:bg-green-600 transition-all cursor-pointer"
      >
        <MessageCircle size={30} />
      </a>

      {/* Main Content */}
      <main className="flex-grow animate-fade-in pt-24 relative max-w-7xl mx-auto w-full px-4 md:px-8">
        <Suspense fallback={<FallbackLoader view={view} />}>
          {view === "home" && (
            <Hero t={t} setView={setView} setToast={setToast} />
          )}

          {view === "menu" && (
            <MenuView
              t={t}
              lang={lang}
              activeRestaurantMenu={activeRestaurantMenu}
              setActiveRestaurantMenu={setActiveRestaurantMenu}
              addToCart={addToCart}
              bookingData={bookingData}
              cart={cart}
              submitBooking={submitBooking}
              availableTablesCount={availableTablesCount}
              setView={setView}
            />
          )}

          {view === "book" && (
            <div className="space-y-12">
              <BookingView
                t={t}
                setView={setView}
                bookingData={bookingData}
                setBookingData={setBookingData}
                handleInputChange={handleInputChange}
                cart={cart}
                getLocalDate={getLocalDate}
                settings={settings}
                availableTablesCount={availableTablesCount}
                submitBooking={submitBooking}
              />
              <TrackView t={t} bookings={bookings} />
            </div>
          )}

          {view === "success" && <SuccessView t={t} setView={setView} />}

          {view === "feedback" && (
            <FeedbackView
              lang={lang}
              db={db}
              showToast={showToast}
              setView={setView}
              t={t}
            />
          )}

          {view === "admin" && (
            <AdminView
              t={t}
              italianTodayAvail={italianTodayAvail}
              orientalTodayAvail={orientalTodayAvail}
              bookings={bookings}
              todayStr={todayStr}
              settings={settings}
              lang={lang}
              users={users}
              db={db}
              fetchUsers={fetchUsers}
              showToast={showToast}
              blacklist={blacklist}
              MENU_ITEMS={MENU_ITEMS}
              setView={setView}
            />
          )}
        </Suspense>
      </main>

      {/* Footer */}
      <Footer t={t} setView={setView} />

      {/* reCAPTCHA Invisible Anchor for Firebase SMS Verification (Deferred)
      <div id="recaptcha-container" className="hidden"></div>
      */}

      {/* Gorgeous OTP Modal (Deferred)
      {otpState.show && (
        <OtpModal
          otpState={otpState}
          onClose={() => setOtpState((prev) => ({ ...prev, show: false }))}
          onVerify={verifyOtpCode}
          onResend={resendOtp}
          t={t}
          lang={lang}
        />
      )}
      */}
      {/* Premium PWA Installation Floating Banner */}
      {showPwaBanner && (
        <div className="fixed bottom-6 left-6 right-6 md:left-8 md:right-auto md:max-w-md z-[120] bg-stone-950/95 dark:bg-stone-900/95 backdrop-blur-xl p-5 md:p-6 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-stone-800 text-white flex flex-col md:flex-row items-start md:items-center gap-4 animate-slide-up no-print">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-brand-orange to-brand-blue"></div>
          
          <button
            onClick={handlePwaDismiss}
            className="absolute top-3.5 right-3.5 p-1 text-stone-500 hover:text-stone-300 hover:bg-stone-800 rounded-full transition-all cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>

          <div className="bg-gradient-to-br from-amber-500/20 to-brand-orange/20 border border-amber-500/30 p-3 rounded-2xl text-amber-400 shrink-0 self-center md:self-start">
            <Smartphone size={24} />
          </div>

          <div className="flex-1 space-y-1 pr-6 md:pr-0">
            <h4 className="text-sm font-black text-amber-400 leading-tight">
              {pwaTranslations[lang]?.title || pwaTranslations["en"].title}
            </h4>
            <p className="text-[11px] text-stone-300 font-semibold leading-relaxed">
              {pwaTranslations[lang]?.desc || pwaTranslations["en"].desc}
            </p>
            <div className="flex gap-3 pt-2.5">
              <button
                onClick={handlePwaInstall}
                className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-stone-950 px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider shadow-md hover:shadow-amber-500/20 transition-all cursor-pointer"
              >
                {pwaTranslations[lang]?.btnInstall || pwaTranslations["en"].btnInstall}
              </button>
              <button
                onClick={handlePwaDismiss}
                className="bg-stone-800 hover:bg-stone-700 text-stone-300 px-4 py-1.5 rounded-xl font-bold text-[10px] transition-all cursor-pointer"
              >
                {pwaTranslations[lang]?.btnDismiss || pwaTranslations["en"].btnDismiss}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Automatic Update Overlay */}
      {showUpdatePrompt && (
        <div className="fixed inset-0 z-[1000] bg-brand-blue/95 backdrop-blur-md flex flex-col items-center justify-center p-8 overflow-hidden text-center">
          <div className="absolute inset-0 bg-radial-gradient from-brand-orange/15 to-transparent opacity-60"></div>
          
          <div className="relative max-w-md w-full bg-white dark:bg-stone-900 rounded-[2.5rem] p-8 md:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.6)] border border-stone-100/10 flex flex-col items-center gap-6 animate-fade-scale">
            {/* Top orange glow strip */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-brand-orange to-brand-blue rounded-t-[2.5rem]"></div>
            
            {/* Pulsing reload icon */}
            <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center text-brand-orange animate-spin-slow">
              <Clock size={40} className="animate-pulse" />
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl font-serif font-bold text-brand-blue dark:text-white leading-tight">
                {updateTranslations[lang]?.title || updateTranslations["en"].title}
              </h3>
              <p className="text-sm text-stone-500 dark:text-stone-300 font-bold leading-relaxed">
                {updateTranslations[lang]?.desc || updateTranslations["en"].desc}
              </p>
            </div>

            {/* Progress indicator */}
            <div className="w-full space-y-2">
              <div className="w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden shadow-inner relative">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 via-brand-orange to-amber-500 rounded-full transition-all duration-[3000ms] ease-out"
                  style={{ width: isUpdating ? '100%' : '0%' }}
                ></div>
              </div>
              <p className="text-xs text-brand-orange font-black uppercase tracking-widest animate-pulse">
                {isUpdating 
                  ? (updateTranslations[lang]?.loading || updateTranslations["en"].loading) 
                  : (updateTranslations[lang]?.btnUpdate || updateTranslations["en"].btnUpdate)}
              </p>
            </div>

            <button
              onClick={handleApplyUpdate}
              disabled={isUpdating}
              className="w-full bg-gradient-to-r from-amber-500 to-brand-orange hover:brightness-110 active:scale-[0.98] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-brand-orange/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <Clock size={18} />
              {updateTranslations[lang]?.btnUpdate || updateTranslations["en"].btnUpdate}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
