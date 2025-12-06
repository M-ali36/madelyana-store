"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/components/context/AppContext";
import { db } from "@/lib/firebaseClient";
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import useCurrency from "@/components/hooks/useCurrency";
import { deductStockForOrder } from "@/lib/deductStock";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, user, setCart } = useAppContext();
  const { format } = useCurrency();

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    country: "",
    city: "",
    street: "",
  });

  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  // ---------------------------------------------------------
  // LOAD ADDRESS FROM: users/{uid}/settings/address
  // ---------------------------------------------------------
  useEffect(() => {
    if (!user) return;

    const loadAddress = async () => {
      let base = {
        fullName: user.fullName || "",
        phone: user.phone || "",
        country: "",
        city: "",
        street: "",
      };

      // Correct path
      const ref = doc(db, "users", user.uid, "settings", "address");
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const saved = snap.data();
        base = {
          fullName: saved.fullName || base.fullName,
          phone: saved.phone || base.phone,
          country: saved.country || "",
          city: saved.city || "",
          street: saved.street || "",
        };
      }

      setAddress(base);
      setLoading(false);
    };

    loadAddress();
  }, [user]);

  // ---------------------------------------------------------
  // GUARDS
  // ---------------------------------------------------------
  if (!user)
    return <div className="p-6 text-center text-gray-600">Login required.</div>;

  if (loading) return <div className="p-6">Loading checkout…</div>;

  if (cart.length === 0)
    return (
      <div className="p-6 text-center">
        <p>Your cart is empty.</p>
        <button
          className="mt-4 px-4 py-2 bg-black text-white rounded-md"
          onClick={() => router.push("/")}
        >
          Continue Shopping
        </button>
      </div>
    );

  // ---------------------------------------------------------
  // TOTALS
  // ---------------------------------------------------------
  const shippingFee = 0;
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const total = subtotal + shippingFee;

  // ---------------------------------------------------------
  // ⭐ PLACE ORDER
  // ---------------------------------------------------------
  async function placeOrder() {
  if (placing) return;
  setPlacing(true);

  try {
    // ---------------------------------------
    // 1) Save updated address to Firestore
    // ---------------------------------------
    await setDoc(
      doc(db, "users", user.uid, "settings", "address"),
      address,
      { merge: true }
    );

    // ---------------------------------------
    // 2) Build order payload
    // ---------------------------------------
    const orderData = {
      userId: user.uid,
      items: cart.map((item) => ({
        productId: item.id,            // correct
        variantId: item.variantId,
        title: item.title,
        image: item.image,
        slug: item.slug,
        qty: item.qty,
        price: item.price,
        variant: item.selectedAttributes || {},  // correct
      })),
      subtotal,
      shipping: shippingFee,
      total,
      address,
      paymentMethod: "COD",
      status: "pending",              // user creates pending order
      stockDeducted: false,           // admin will deduct later
      createdAt: serverTimestamp(),
    };

    console.log("ORDER SENT:", JSON.stringify(orderData));

    // ---------------------------------------
    // 3) Save order to Firestore
    // ---------------------------------------
    const orderRef = await addDoc(collection(db, "orders"), orderData);

    // ---------------------------------------
    // 4) Clear cart locally (user cart)
    // ---------------------------------------
    setCart([]);
    localStorage.removeItem("cart");

    // ---------------------------------------
    // 5) Redirect to success page
    // ---------------------------------------
    router.push(`/checkout/success/${orderRef.id}`);

  } catch (err) {
    console.error("ORDER ERROR:", err);
    alert("Could not place order. Check console.");
  }

  setPlacing(false);
}


  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-3xl font-semibold mb-10">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-10">
          {/* Address */}
          <section className="p-6 bg-white shadow rounded-md border">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={address.fullName}
                placeholder="Full Name"
                onChange={(e) =>
                  setAddress({ ...address, fullName: e.target.value })
                }
                className="border p-3 rounded-md"
              />
              <input
                type="text"
                value={address.phone}
                placeholder="Phone"
                onChange={(e) =>
                  setAddress({ ...address, phone: e.target.value })
                }
                className="border p-3 rounded-md"
              />

              <input
                type="text"
                value={address.country}
                placeholder="Country"
                onChange={(e) =>
                  setAddress({ ...address, country: e.target.value })
                }
                className="border p-3 rounded-md"
              />
              <input
                type="text"
                value={address.city}
                placeholder="City"
                onChange={(e) =>
                  setAddress({ ...address, city: e.target.value })
                }
                className="border p-3 rounded-md"
              />

              <input
                type="text"
                value={address.street}
                placeholder="Street Address"
                onChange={(e) =>
                  setAddress({ ...address, street: e.target.value })
                }
                className="md:col-span-2 border p-3 rounded-md"
              />
            </div>
          </section>

          {/* Payment */}
          <section className="p-6 bg-white shadow rounded-md border">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" checked readOnly />
              <span className="text-gray-700 font-medium">
                Cash on Delivery
              </span>
            </label>

            <p className="text-gray-500 text-sm mt-2">
              More payment methods coming soon.
            </p>
          </section>
        </div>

        {/* SUMMARY */}
        <aside className="p-6 bg-white shadow rounded-md border h-fit">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

          <div className="space-y-3 border-b pb-4 mb-4">
            {cart.map((item) => (
              <div key={item.variantId} className="flex justify-between">
                <span>
                  {item.title} × {item.qty}
                </span>
                <span>{format(item.price * item.qty)}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between mb-2">
            <span>Subtotal</span>
            <span>{format(subtotal)}</span>
          </div>

          <div className="flex justify-between mb-4">
            <span>Shipping</span>
            <span>{format(shippingFee)}</span>
          </div>

          <div className="flex justify-between border-t pt-4 text-xl font-semibold">
            <span>Total</span>
            <span>{format(total)}</span>
          </div>

          <button
            onClick={placeOrder}
            disabled={placing}
            className={`mt-6 w-full py-3 rounded-md transition ${
              placing
                ? "bg-gray-400"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            {placing ? "Placing Order…" : "Place Order"}
          </button>
        </aside>
      </div>
    </div>
  );
}
