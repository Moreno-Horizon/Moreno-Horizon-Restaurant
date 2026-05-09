import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy, useRef } from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import {
  Menu as MenuIcon,
  X,
  ChevronDown,
  Globe,
  Plus,
  Check,
  MessageCircle,
  Moon,
  Sun,
  Clock,
  Utensils,
} from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

// Firebase Instance
import { db } from "./firebase";

// Externalized Data and Translations
import { translations } from "./translations";
import { CATEGORIES, MENU_ITEMS } from "./data";

// Core Components (Always loaded)
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import CartSidebar from "./components/CartSidebar";

// Lazy Loaded Views (Loaded on demand to improve performance)
const BookingView = lazy(() => import("./components/BookingView"));
const AdminView = lazy(() => import("./components/AdminView"));
const MenuView = lazy(() => import("./components/MenuView"));
const TrackView = lazy(() => import("./components/TrackView"));
const SuccessView = lazy(() => import("./components/SuccessView"));

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

export default function App() {
  // Computed once per mount — date doesn't change during a session
  const todayStr = useMemo(() => getLocalDate(), []);

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
  const [activeRestaurantMenu, setActiveRestaurantMenu] = useState("oriental");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  // --- Back Button & History Support ---
  useEffect(() => {
    // Initial state setup
    if (!window.history.state) {
      window.history.replaceState({ view: "home" }, "");
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
    } catch (e) {}
  }, []);

  // Admin Auth check for notifications is now read from localStorage directly when needed.




  const showToast = useCallback((msg, duration = 3000) => {
    setToast(msg);
    setTimeout(() => setToast(null), duration);
  }, []);

  const [users, setUsers] = useState([]);
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
  const [settings, setSettings] = useState({
    adminPass: "admin123",
    shift1: "18:30 - 19:30",
    shift2: "20:00 - 21:00",
    shiftOri: "19:00 - 20:00",
    capacityItalian: 40,
    capacityOriental: 25,
    shiftLimitItalian: 20,
    isClosedItalian: false,
    isClosedOriental: false,
  });

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

    // Sync Settings
    const unsubscribeSettings = onSnapshot(
      doc(db, "settings", "general"),
      (docSnap) => {
        if (docSnap.exists()) {
          console.log("Settings loaded from DB:", docSnap.data());
          setSettings((prev) => ({ ...prev, ...docSnap.data() }));
        } else {
          console.log("Settings document does not exist yet.");
        }
        settingsLoaded = true;
        checkLoading();
      },
      (error) => {
        console.error("Error fetching settings:", error);
        settingsLoaded = true;
        checkLoading();
      }
    );

    // Sync Bookings & Alert Logic
    const bookingsQuery = query(collection(db, "bookings"), where("date", ">=", todayStr));
    const unsubscribeBookings = onSnapshot(
      bookingsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        data.sort((a, b) => b.id - a.id);

        const currentLastId = lastBookingIdRef.current;
        if (
          bookingsLoaded &&
          currentLastId &&
          data.length > 0 &&
          data[0].id > currentLastId &&
          localStorage.getItem("morenoAdminAuth") === "true"
        ) {
          playSound("success");
          const currentLang = localStorage.getItem("prefLang") || "ar";
          const alertMsg = translations[currentLang]?.newBookingAlert || translations["en"]?.newBookingAlert || "حجز جديد وارد!";
          showToast(alertMsg);
        }
        if (data.length > 0) {
          lastBookingIdRef.current = data[0].id;
        }
        setBookings(data);

        bookingsLoaded = true;
        checkLoading();
      },
      (error) => {
        console.error("Error fetching bookings:", error);
        bookingsLoaded = true;
        checkLoading();
      }
    );

    // Sync Users
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(data);
    });

    const unsubscribeBlacklist = onSnapshot(
      collection(db, "blacklist"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBlacklist(data);
      },
    );

    return () => {
      clearTimeout(fallbackTimer);
      unsubscribeSettings();
      unsubscribeBookings();
      unsubscribeUsers();
      unsubscribeBlacklist();
    };
  }, [todayStr, playSound, showToast]);

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
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      // Thursday Rule for Oriental
      if (name === "restaurant" && value === "oriental") {
        const selectedDate = new Date(bookingData.date);
        if (selectedDate.getDay() === 4) {
          showToast(t.orientalThursdayMsg, 10000);
          return;
        }
      }

      if (name === "date") {
        const selectedDate = new Date(value);
        if (
          selectedDate.getDay() === 4 &&
          bookingData.restaurant === "oriental"
        ) {
          setBookingData({
            ...bookingData,
            date: value,
            restaurant: "",
            time: "",
          });
          showToast(t.orientalThursdayMsg, 10000);
          return;
        }
      }

      if (name === "room") {
        const numericValue = value.replace(/\D/g, "");
        if (numericValue.length <= 4) {
          setBookingData({ ...bookingData, room: numericValue });
        }
        return;
      }

      if (name === "restaurant") {
        setBookingData({ ...bookingData, restaurant: value, time: "" });
        setActiveRestaurantMenu(value);
        
        if (value === "oriental") {
          const allItems = MENU_ITEMS.find(i => i.id === 1);
          if (allItems) {
            setCart([{ ...allItems, qty: Number(bookingData.guests || 1) }]);
          }
        } else {
          setCart([]); // Clear cart if switching back to Italian
        }
      } else if (name === "guests") {
        const guestsVal = Number(value);
        setBookingData({ ...bookingData, guests: value });
        
        // Sync Oriental 'All Items' qty with pax count
        if (bookingData.restaurant === "oriental") {
          setCart(prev => {
            const hasAllItems = prev.some(i => i.id === 1);
            if (hasAllItems) {
              return prev.map(i => i.id === 1 ? { ...i, qty: guestsVal } : i);
            } else {
              const allItems = MENU_ITEMS.find(i => i.id === 1);
              return allItems ? [{ ...allItems, qty: guestsVal }] : prev;
            }
          });
        }
      } else {
        setBookingData({ ...bookingData, [name]: value });
      }
    },
    [bookingData, t],
  );



  const submitBooking = useCallback(
    async (eOrStatus) => {
      if (eOrStatus && eOrStatus.preventDefault) eOrStatus.preventDefault();
      const overrideStatus = typeof eOrStatus === "string" ? eOrStatus : null;

      if (cart.length === 0) {
        showToast(t.selectItemsFirst || "يرجى اختيار أصناف من المنيو أولاً قبل الحجز", 4000);
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
      const isBlacklisted = blacklist.some(
        (item) =>
          item.value === bookingData.phone || item.value === bookingData.room,
      );
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
          dailyItal + requestedGuests > (settings.capacityItalian || 40) ||
          shiftItal + requestedGuests > (settings.shiftLimitItalian || 20)
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

        if (dailyOri + requestedGuests > (settings.capacityOriental || 25)) {
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

      let orderDetails = t.noFoodOrders;
      let engOrderDetails = "No Food Orders";
      if (cart.length > 0) {
        orderDetails = cart
          .map((item) => `- ${item.qty}x ${item.name[lang] || item.name["en"]}`)
          .join("\n");
        engOrderDetails = cart
          .map((item) => `- ${item.qty}x ${item.name["en"] || item.name["ar"] || item.name}`)
          .join("\n");
      }

      const resName =
        bookingData.restaurant === "italian" ? t.italian : t.oriental;

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
        orderDetails: orderDetails,
        engOrderDetails: engOrderDetails,
        notes: bookingData.notes || "",
        total: 0,
        items: cart,
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
        const response = await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: JSON.stringify({
            command: "newBooking",
            booking: newBooking
          }),
        });
        
        console.log("Master Sheet Sync Triggered");
      } catch (error) {
        console.error("Sheet Sync error:", error);
      } finally {
        setTimeout(() => setView("success"), 1000);
      }
    },
    [bookingData, blacklist, t, bookings, lang, cart, settings, playSound],
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

  const updateCartQty = useCallback(
    (id, delta) => {
      setCart((prev) => {
        const currentTotal = prev.reduce((sum, i) => sum + i.qty, 0);

        return prev.map((item) => {
          if (item.id === id) {
            if (delta > 0) {
              const paxCount = parseInt(bookingData.guests) || 0;
              if (currentTotal >= paxCount) {
                showToast(t.paxLimitReached);
                return item;
              }
            }
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : item;
          }
          return item;
        });
      });
    },
    [bookingData.guests, t.paxLimitReached, showToast],
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

  // Weekly Trend Data
  const weeklyData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const offset = d.getTimezoneOffset();
      const local = new Date(d.getTime() - offset * 60 * 1000);
      return local.toISOString().split("T")[0];
    });
    return last7Days.map((date) => ({
      date,
      count: bookings.filter((b) => b.date === date).length,
    }));
  }, [bookings]);

  const maxWeeklyCount = useMemo(
    () => Math.max(...weeklyData.map((d) => d.count), 1),
    [weeklyData],
  );

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
            (settings.capacityItalian || 40) - dailyItal,
            (settings.shiftLimitItalian || 20) - shiftItal,
          ),
        );
      }
      return Math.max(0, (settings.capacityItalian || 40) - dailyItal);
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

      return Math.max(0, (settings.capacityOriental || 25) - dailyOri);
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
            fetchPriority="high"
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
      className={`min-h-screen flex flex-col ${t.dir === "rtl" ? "font-cairo" : ""}`}
    >
      <div id="scroll-progress"></div>

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
          )}

          {view === "track" && <TrackView t={t} bookings={bookings} />}

          {view === "success" && <SuccessView t={t} setView={setView} />}

          {view === "admin" && (
            <AdminView
              t={t}
              italianTodayAvail={italianTodayAvail}
              orientalTodayAvail={orientalTodayAvail}
              bookings={bookings}
              todayStr={todayStr}
              weeklyData={weeklyData}
              maxWeeklyCount={maxWeeklyCount}
              settings={settings}
              lang={lang}
              users={users}
              db={db}
              showToast={showToast}
              blacklist={blacklist}
              MENU_ITEMS={MENU_ITEMS}
            />
          )}
        </Suspense>
      </main>

      {/* Footer */}
      <Footer t={t} setView={setView} />
    </div>
  );
}
