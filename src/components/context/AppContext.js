"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { auth, db } from "@/lib/firebaseClient";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

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

  // To prevent double-merge loops
  const hasMergedRef = useRef(false);

  // ----------------------------------------
  // Load from LOCAL STORAGE (Guest Mode)
  // ----------------------------------------
  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("cart") || "[]"));
    setWishlist(JSON.parse(localStorage.getItem("wishlist") || "[]"));
    setNavState(JSON.parse(localStorage.getItem("navState") || "false"));
  }, []);

  // ----------------------------------------
  // SAVE local storage
  // ----------------------------------------
  useEffect(() => localStorage.setItem("cart", JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem("wishlist", JSON.stringify(wishlist)), [wishlist]);
  useEffect(() => localStorage.setItem("navState", JSON.stringify(navState)), [navState]);

  // ----------------------------------------
  // AUTH LISTENER (Runs ONCE)
  // ----------------------------------------
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        hasMergedRef.current = false;
        setUser(null);
        return;
      }

      // Load profile
      const ref = doc(db, "users", firebaseUser.uid);
      const snap = await getDoc(ref);

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        fullName: snap.exists() ? snap.data().fullName : "",
        phone: snap.exists() ? snap.data().phone : "",
        role: snap.exists() ? snap.data().role : "user",
      });

      // Prevent re-merging on every state change
      if (hasMergedRef.current) return;
      hasMergedRef.current = true;

      // Load Firestore cart + wishlist
      const fsCart = await loadFirestoreCart(firebaseUser.uid);
      const fsWishlist = await loadFirestoreWishlist(firebaseUser.uid);

      // Merge local + Firestore
      const mergedCart = mergeCart(fsCart, JSON.parse(localStorage.getItem("cart") || "[]"));
      const mergedWishlist = mergeWishlist(fsWishlist, JSON.parse(localStorage.getItem("wishlist") || "[]"));

      // Save merged data to UI + local storage
      setCart(mergedCart);
      setWishlist(mergedWishlist);

      // Save merged data -> Firestore
      await overwriteFirestoreCart(firebaseUser.uid, mergedCart);
      await overwriteFirestoreWishlist(firebaseUser.uid, mergedWishlist);
    });

    return () => unsub();
  }, []);

  // ----------------------------------------
  // 🔥 FIRESTORE HELPERS
  // ----------------------------------------
  async function loadFirestoreCart(uid) {
    const snap = await getDocs(collection(db, "users", uid, "cart"));
    return snap.docs.map((d) => d.data());
  }

  async function loadFirestoreWishlist(uid) {
    const snap = await getDocs(collection(db, "users", uid, "wishlist"));
    return snap.docs.map((d) => d.data());
  }

  async function overwriteFirestoreCart(uid, mergedCart) {
    const ref = collection(db, "users", uid, "cart");
    const snap = await getDocs(ref);

    for (const d of snap.docs) await deleteDoc(d.ref);
    for (const item of mergedCart) {
      await setDoc(doc(db, "users", uid, "cart", item.variantId), item);
    }
  }

  async function overwriteFirestoreWishlist(uid, mergedWishlist) {
    const ref = collection(db, "users", uid, "wishlist");
    const snap = await getDocs(ref);

    for (const d of snap.docs) await deleteDoc(d.ref);
    for (const item of mergedWishlist) {
      await setDoc(doc(db, "users", uid, "wishlist", item.id), item);
    }
  }

  // ----------------------------------------
  // MERGE LOGIC
  // ----------------------------------------
  function mergeCart(fsCart, localCart) {
    const map = new Map();

    for (const item of fsCart) map.set(item.variantId, item);

    for (const item of localCart) {
      if (map.has(item.variantId)) {
        const existing = map.get(item.variantId);
        map.set(item.variantId, {
          ...existing,
          qty: Math.min(existing.qty + item.qty, existing.maxQty || 99),
        });
      } else {
        map.set(item.variantId, item);
      }
    }

    return Array.from(map.values());
  }

  function mergeWishlist(fsWishlist, localWishlist) {
    const map = new Map();
    for (const item of fsWishlist) map.set(item.id, item);
    for (const item of localWishlist) map.set(item.id, item);
    return Array.from(map.values());
  }

  // ----------------------------------------
  // Cart Utilities
  // ----------------------------------------
  const updateCartQty = (variantId, qty) => {
    setCart((prev) =>
      prev.map((i) => (i.variantId === variantId ? { ...i, qty } : i))
    );
  };

  const removeFromCart = (variantId) => {
    setCart((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  // ----------------------------------------
  // Currency
  // ----------------------------------------
  const [currency, setCurrency] = useState("USD");
  const currencyRates = { USD: 1, AED: 3.67, EGP: 50 };

  // ----------------------------------------
  // PROVIDER VALUE
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
    updateCartQty,
    removeFromCart,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ----------------------------------------
// Clear Cart Completely
// ----------------------------------------
const clearCart = async () => {
  setCart([]);
  localStorage.setItem("cart", "[]");

  if (user?.uid) {
    const ref = collection(db, "users", user.uid, "cart");
    const snap = await getDocs(ref);
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
    }
  }
};


export function useAppContext() {
  return useContext(AppContext);
}
