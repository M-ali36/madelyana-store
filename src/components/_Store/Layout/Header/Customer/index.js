"use client";

import { HiOutlineUser } from "react-icons/hi";
import { auth } from "@/lib/firebaseClient";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function MiniAccount() {
  const [user, setUser] = useState(null);

  // Listen for auth changes
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsub();
  }, []);

  // Destination:
  // If logged in → /customer
  // If not → /login
  const accountHref = user ? "/customer" : "/login";

  return (
    <Link href={accountHref} className="relative control-btn">
      <HiOutlineUser className="w-6 h-6" />

      {/* Small green dot if logged in (optional) */}
      {user && (
        <span className="absolute -top-1 -right-1 bg-green-500 w-2.5 h-2.5 rounded-full border border-white"></span>
      )}
    </Link>
  );
}
