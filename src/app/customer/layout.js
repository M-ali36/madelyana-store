// app/customer/layout.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth, db } from "@/lib/firebaseClient";
import { doc, getDoc } from "firebase/firestore";
import { useRouter, usePathname } from "next/navigation";

export default function CustomerLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // -------------------------------------------------------
  // Load User Info from Firestore
  // -------------------------------------------------------
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        router.replace("/login");
        return;
      }

      const ref = doc(db, "users", currentUser.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setUserData(snap.data());
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading your account...
      </div>
    );
  }

  // -------------------------------------------------------
  // Sidebar Navigation Items
  // -------------------------------------------------------
  const navItems = [
    { label: "Dashboard", href: "/customer" },
    { label: "Orders", href: "/customer/orders" },
    { label: "Wishlist", href: "/customer/wishlist" },
    { label: "Settings", href: "/customer/settings" },
    { label: "Address", href: "/customer/address" },
  ];

  const handleLogout = async () => {
    await auth.signOut();
    document.cookie = "firebase_id_token=; path=/; max-age=0;";
    document.cookie = "auth_role=; path=/; max-age=0;";
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800">
            Hello, {userData?.fullName || "Customer"}
          </h2>
          <p className="text-sm text-gray-500">{userData?.email}</p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition 
                  ${
                    active
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-auto px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
