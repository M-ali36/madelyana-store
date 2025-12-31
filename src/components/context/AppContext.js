"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";

import { auth, db } from "@/lib/firebaseClient";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

import { usePathname } from "next/navigation";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // ----------------------------------------
  // STATE
  // ----------------------------------------
  const [user, setUser] = useState(null);

  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const [navState, setNavState] = useState("");
  const [scrollPosition, setScrollPosition] = useState(0);
  const [scrollDirection, setScrollDirection] = useState('up');

  const pathname = usePathname();

  // Prevent multiple Firestore merges
  const hasMergedRef = useRef(false);

  // ----------------------------------------
  // INITIAL LOAD FROM LOCAL STORAGE
  // ----------------------------------------
  useEffect(() => {
    const localCart = localStorage.getItem("cart");
    const localWishlist = localStorage.getItem("wishlist");
    const localNav = localStorage.getItem("navState");

    setCart(localCart ? JSON.parse(localCart) : []);
    setWishlist(localWishlist ? JSON.parse(localWishlist) : []);
    setNavState(localNav || "");
  }, []);

  // ----------------------------------------
  // SAVE TO STORAGE ON CHANGE
  // ----------------------------------------
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem("navState", navState);
  }, [navState]);

  // ----------------------------------------
  // CLEAR navState when route changes
  // ----------------------------------------
  useEffect(() => {
    setNavState("");
  }, [pathname]);

  // ----------------------------------------
  // HELPER — Compare carts to avoid duplicate merges
  // ----------------------------------------
  function cartsAreEqual(a, b) {
    if (a.length !== b.length) return false;
    const map = new Map(a.map((i) => [i.variantId, i.qty]));

    for (const item of b) {
      if (!map.has(item.variantId)) return false;
      if (map.get(item.variantId) !== item.qty) return false;
    }

    return true;
  }

  // ----------------------------------------
  // AUTH STATE LISTENER
  // ----------------------------------------
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        hasMergedRef.current = false;
        setUser(null);
        return;
      }

      // Load user profile
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        fullName: userSnap.exists() ? userSnap.data().fullName : "",
        phone: userSnap.exists() ? userSnap.data().phone : "",
        role: userSnap.exists() ? userSnap.data().role : "user",
      });

      // --- Load Firestore cart & wishlist ---
      const fsCart = await loadFirestoreCart(firebaseUser.uid);
      const fsWishlist = await loadFirestoreWishlist(firebaseUser.uid);

      // --- Load Local versions ---
      const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
      const localWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");

      // ----------------------------------------
      // FIX: Only merge if carts differ
      // ----------------------------------------
      if (cartsAreEqual(fsCart, localCart)) {
        hasMergedRef.current = true;
        return;
      }

      hasMergedRef.current = true;

      // Merge
      const mergedCart = mergeCart(fsCart, localCart);
      const mergedWishlist = mergeWishlist(fsWishlist, localWishlist);

      setCart(mergedCart);
      setWishlist(mergedWishlist);

      // Save updated merged versions
      await overwriteFirestoreCart(firebaseUser.uid, mergedCart);
      await overwriteFirestoreWishlist(firebaseUser.uid, mergedWishlist);
    });

    return () => unsub();
  }, []);

  // ----------------------------------------
  // FIRESTORE HELPERS
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

    // Firestore first
    for (const item of fsCart) {
      map.set(item.variantId, item);
    }

    // Local second
    for (const item of localCart) {
      if (map.has(item.variantId)) {
        const existing = map.get(item.variantId);
        map.set(item.variantId, {
          ...existing,
          qty: Math.min(
            existing.qty + item.qty,
            existing.maxQty || 99
          ),
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
  // CART ACTION HELPERS
  // ----------------------------------------
  const updateCartQty = (variantId, qty) => {
    setCart((prev) =>
      prev.map((i) =>
        i.variantId === variantId ? { ...i, qty: Math.max(1, qty) } : i
      )
    );
  };

  const removeFromCart = (variantId) => {
    setCart((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  const clearCart = async () => {
    setCart([]);
    localStorage.setItem("cart", "[]");

    if (user?.uid) {
      const ref = collection(db, "users", user.uid, "cart");
      const snap = await getDocs(ref);
      for (const d of snap.docs) await deleteDoc(d.ref);
    }
  };

  // ----------------------------------------
  // REAL-TIME FIRESTORE SYNC (Only after merge)
  // ----------------------------------------
  useEffect(() => {
    if (!user?.uid) return;
    if (!hasMergedRef.current) return;

    const syncCart = async () => {
      const ref = collection(db, "users", user.uid, "cart");

      // Delete old
      const snap = await getDocs(ref);
      for (const d of snap.docs) await deleteDoc(d.ref);

      // Write new
      for (const item of cart) {
        await setDoc(doc(db, "users", user.uid, "cart", item.variantId), item);
      }
    };

    syncCart();
  }, [cart, user?.uid]);

  // ----------------------------------------
  // CURRENCY
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
    scrollDirection,
    currency,
    setCurrency,
    currencyRates,
    setUser,
    setCart,
    setWishlist,
    setNavState,
    setScrollPosition,
    setScrollDirection,
    updateCartQty,
    removeFromCart,
    clearCart,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}
