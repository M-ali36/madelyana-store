"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HiOutlineHome,
  HiOutlineShoppingBag,
  HiOutlineUsers,
  HiOutlineCog,
  HiOutlineChartBar,
  HiOutlineLogout,
} from "react-icons/hi";

import { useEffect, useState } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebaseClient";
import { doc, getDoc } from "firebase/firestore";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));

        if (!snap.exists()) {
          router.replace("/login");
          return;
        }

        const data = snap.data();

        if (data.role !== "admin") {
          router.replace("/");
          return;
        }

        setAllowed(true);
      } finally {
        setChecking(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Checking access…
      </div>
    );
  }

  if (!allowed) return null;

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: HiOutlineHome },
    { label: "Products", href: "/admin/products", icon: HiOutlineShoppingBag },
    { label: "Orders", href: "/admin/orders", icon: HiOutlineChartBar },
    { label: "Users", href: "/admin/users", icon: HiOutlineUsers },
    { label: "Settings", href: "/admin/settings", icon: HiOutlineCog },
  ];

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {/* SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 shadow-sm">
        <div className="px-6 py-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-primary">Admin Panel</h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2 text-left rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition"
          >
            <HiOutlineLogout className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="flex-1">
        <div className="md:hidden sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center shadow-sm">
          <Link href="/admin" className="text-lg font-semibold text-primary">
            Admin Panel
          </Link>

          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:underline"
          >
            Logout
          </button>
        </div>

        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
