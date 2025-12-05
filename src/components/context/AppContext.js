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
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem("navState", JSON.stringify(navState));
  }, [navState]);

  // ----------------------------------------
  // FIREBASE AUTH LISTENER (REAL USER SYNC)
  // ----------------------------------------
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        return;
      }

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
  // ⭐ CURRENCY SYSTEM
  // -----------------------------------------
  const [currency, setCurrency] = useState("USD");

  const currencyRates = {
    USD: 1,
    AED: 3.67,
    EGP: 50.0,
  };

  // ----------------------------------------
  // ⭐ CART UTILITY FUNCTIONS (NEW)
  // ----------------------------------------

  // Update quantity of a cart item
  const updateCartQty = (variantId, qty) => {
    setCart((current) =>
      current.map((item) =>
        item.variantId === variantId
          ? { ...item, qty }
          : item
      )
    );
  };

  // Remove a cart item completely
  const removeFromCart = (variantId) => {
    setCart((current) =>
      current.filter((item) => item.variantId !== variantId)
    );
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

    updateCartQty,     // ⭐ Added
    removeFromCart,    // ⭐ Added
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}
