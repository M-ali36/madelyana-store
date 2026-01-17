"use client";

import Link from "@/components/Ui/Link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import {
  HiOutlineHome,
  HiOutlineShoppingBag,
  HiOutlineUsers,
  HiOutlineCog,
  HiOutlineChartBar,
  HiOutlineLogout,
  HiOutlineBell,
} from "react-icons/hi";

import { RiUserLocationLine, RiRobot2Line } from "react-icons/ri";
import { PiChartLineUp } from "react-icons/pi";

import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebaseClient";
import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";
import { MdOutlinePriceCheck } from "react-icons/md";

import { notifySoundUrl } from "@/app/sounds";

export default function AdminLayoutPage({ children, locale }) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("admin.layout");

  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  // 🔔 Active users
  const [activeUsers, setActiveUsers] = useState(0);
  const prevCountRef = useRef(0);
  const audioRef = useRef(null);

  // ------------------------------
  // AUTH GUARD
  // ------------------------------
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (!snap.exists() || snap.data().role !== "admin") {
          router.replace("/");
          return;
        }

        setAllowed(true);
      } finally {
        setChecking(false);
      }
    });

    return () => unsub();
  }, []);

  // ------------------------------
  // INIT AUDIO (CLIENT ONLY)
  // ------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    audioRef.current = new Audio(notifySoundUrl);
    audioRef.current.volume = 0.6;
  }, []);

  // ------------------------------
  // LIVE ACTIVE USERS OBSERVER  ⭐ FIXED
  // ------------------------------
  useEffect(() => {
    if (!allowed) return;

    const ACTIVE_WINDOW = 60 * 1000; // last 60 seconds
    const sessionsRef = collection(db, "sessions");

    const unsub = onSnapshot(sessionsRef, (snap) => {
      const now = Date.now();

      const activeList = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((user) => {
          if (!user.lastSeen) return false;
          const lastSeenMs = user.lastSeen.toMillis();
          return now - lastSeenMs < ACTIVE_WINDOW;
        });

      // 🔊 Play sound only when count increases
      if (activeList.length > prevCountRef.current) {
        audioRef.current?.play().catch(() => {});
      }

      prevCountRef.current = activeList.length;
      setActiveUsers(activeList.length);
    });

    return () => unsub();
  }, [allowed]);

  // ------------------------------
  // LANGUAGE SWITCH
  // ------------------------------
  const switchLocale = locale === "en" ? "ar" : "en";

  const handleSwitchLanguage = () => {
    router.push(`/${switchLocale}${pathname.replace(/^\/(en|ar)/, "")}`);
  };

  // ------------------------------
  // NAV ITEMS
  // ------------------------------
  const navItems = [
    { label: t("nav.dashboard"), href: "/admin", icon: HiOutlineHome },
    { label: t("nav.products"), href: "/admin/products", icon: HiOutlineShoppingBag },
    { label: t("nav.orders"), href: "/admin/orders", icon: HiOutlineChartBar },
    { label: t("nav.users"), href: "/admin/users", icon: HiOutlineUsers },
    { label: t("nav.settings"), href: "/admin/settings", icon: HiOutlineCog },
    { label: t("nav.userObserver"), href: "/admin/users-observer", icon: RiUserLocationLine },
    { label: "Image Gen", href: "/admin/ai-image", icon: RiRobot2Line },
    { label: "Image Video Gen", href: "/admin/ai-image-video", icon: RiRobot2Line },
    { label: "Price Cost Settings", href: "/admin/static-data", icon: MdOutlinePriceCheck },
    { label: "Analytics", href: "/admin/analytics", icon: PiChartLineUp },
  ];

  const handleLogout = async () => {
    await auth.signOut();
    document.cookie = "firebase_id_token=; path=/; max-age=0;";
    document.cookie = "auth_role=; path=/; max-age=0;";
    localStorage.clear();
    sessionStorage.clear();
    router.replace("/login");
  };

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-600">
        {t("checking")}
      </div>
    );
  }

  if (!allowed) return null;

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {/* SIDEBAR */}
      <aside className="hidden w-64 flex-col border-r border-gray-200 bg-white shadow-sm md:flex">
        <div className="flex items-center justify-between border-b px-6 py-6">
          <h1 className="text-xl font-semibold text-primary">{t("title")}</h1>
          <button onClick={handleSwitchLanguage} className="text-sm hover:underline">
            {locale === "en" ? "AR" : "EN"}
          </button>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              locale={locale}
              className={`flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition
                ${
                  pathname === href
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="border-t p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600"
          >
            <HiOutlineLogout className="h-5 w-5" />
            {t("logout")}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1">
        {/* TOP BAR */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-white px-6 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <HiOutlineBell className="h-6 w-6 text-gray-600" />
            <span className="text-sm font-medium">
              {t("activeUsers")}:{" "}
              <span className="font-semibold text-primary">{activeUsers}</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleSwitchLanguage}
              className="text-sm font-medium text-gray-600 hover:underline"
            >
              {locale === "en" ? "AR" : "EN"}
            </button>

            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:underline"
            >
              {t("logout")}
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
