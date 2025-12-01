"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebaseClient";
import { doc, getDoc } from "firebase/firestore";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // ----------------------------------------
  // STATE
  // ----------------------------------------
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [navState, setNavState] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  // ----------------------------------------
  // LOAD INITIAL STATE FROM LOCAL STORAGE
  // ----------------------------------------
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    const storedWish = localStorage.getItem("wishlist");
    const storedNav = localStorage.getItem("navState");

    if (storedCart) setCart(JSON.parse(storedCart));
    if (storedWish) setWishlist(JSON.parse(storedWish));
    if (storedNav) setNavState(JSON.parse(storedNav));
  }, []);

  // ----------------------------------------
  // SAVE TO LOCAL STORAGE
  // ----------------------------------------
  useEffect(() => localStorage.setItem("cart", JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem("wishlist", JSON.stringify(wishlist)), [wishlist]);
  useEffect(() => localStorage.setItem("navState", JSON.stringify(navState)), [navState]);

  // ----------------------------------------
  // FIREBASE AUTH LISTENER (REAL USER SYNC)
  // ----------------------------------------
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        return;
      }

      // Fetch user profile from Firestore
      const ref = doc(db, "users", firebaseUser.uid);
      const snap = await getDoc(ref);

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        fullName: snap.exists() ? snap.data().fullName : "",
        role: snap.exists() ? snap.data().role : "user",
      });
    });

    return () => unsub();
  }, []);

  // ----------------------------------------
  // SCROLL POSITION TRACKING
  // ----------------------------------------
  useEffect(() => {
    const handleScroll = () => setScrollPosition(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // -----------------------------------------
  // ⭐ NEW: Currency System
  // -----------------------------------------
  const [currency, setCurrency] = useState("USD");

  // Define base exchange rates (static or fetched from API)
  const currencyRates = {
    USD: 1,      // base
    AED: 3.67,   // 1 USD = 3.67 AED
    EGP: 50.00,  // example → adjust manually
  };


  // ----------------------------------------
  // CONTEXT VALUE
  // ----------------------------------------
  const value = {
    user,
    cart,
    wishlist,
    navState,
    scrollPosition,
    currency,
    setCurrency,
    currencyRates,

    setUser,
    setCart,
    setWishlist,
    setNavState,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}
