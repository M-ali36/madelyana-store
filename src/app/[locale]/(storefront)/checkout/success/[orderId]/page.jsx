"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebaseClient";
import { doc, getDoc } from "firebase/firestore";
import useCurrency from "@/components/hooks/useCurrency";
import Link from "@/components/Ui/Link";
import { useLocale } from "next-intl";

export default function OrderSuccessPage() {
  const router = useRouter();
  const { orderId } = useParams();
  const { format } = useCurrency();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const locale = useLocale();

  // --------------------------------------------
  // Load order from Firestore
  // --------------------------------------------
  useEffect(() => {
    if (!orderId) return;

    const loadOrder = async () => {
      const ref = doc(db, "orders", orderId);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        setOrder(null);
        setLoading(false);
        return;
      }

      setOrder({ id: snap.id, ...snap.data() });
      setLoading(false);
    };

    loadOrder();
  }, [orderId]);

  // --------------------------------------------
  // UI: Loading
  // --------------------------------------------
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center text-gray-600">
        Loading your order…
      </div>
    );
  }

  // --------------------------------------------
  // UI: Not Found
  // --------------------------------------------
  if (!order) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <h1 className="text-2xl font-semibold text-gray-800">
          Order Not Found
        </h1>
        <p className="mt-2 text-gray-600">
          We could not find this order.
        </p>

        <Link
          href="/"
          className="inline-block mt-6 px-4 py-2 bg-neutral-900 text-white rounded-md"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  // --------------------------------------------
  // Extract order data
  // --------------------------------------------
  const { items, subtotal, shipping, total, address } = order;

  return (
    <div className="max-w-3xl mx-auto py-16">
      {/* Success banner */}
      <div className="bg-green-100 border border-green-300 text-green-800 p-6 rounded-md shadow mb-10">
        <h1 className="text-2xl font-semibold">Thank you! 🎉</h1>
        <p className="mt-2">
          Your order has been placed successfully.
        </p>
        <p className="mt-1 text-sm">Order ID: <strong>{orderId}</strong></p>
      </div>

      {/* Order summary */}
      <div className="bg-white p-6 rounded-md shadow border mb-10">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

        <div className="space-y-3 border-b pb-4 mb-4">
          {items.map((item) => (
            <div
              key={item.variantId}
              className="flex justify-between text-gray-700"
            >
              <span>
                {item.title}
                {item.variant?.color && (
                  <> — {item.variant.color}</>
                )}
                {item.variant?.size && (
                  <> / {item.variant.size}</>
                )}
                {" "}× {item.qty}
              </span>

              <span className="font-medium">
                {format(item.price * item.qty)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-between mb-1">
          <span className="text-gray-600">Subtotal</span>
          <span>{format(subtotal)}</span>
        </div>

        <div className="flex justify-between mb-3">
          <span className="text-gray-600">Shipping</span>
          <span>{format(shipping)}</span>
        </div>

        <div className="flex justify-between text-xl font-semibold border-t pt-4">
          <span>Total</span>
          <span>{format(total)}</span>
        </div>
      </div>

      {/* Shipping info */}
      <div className="bg-white p-6 rounded-md shadow border mb-10">
        <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>

        <p className="text-gray-700">
          {address.fullName}<br />
          {address.phone}<br />
          {address.street}<br />
          {address.city}, {address.country}
        </p>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Link
          locale={locale}
          href="/customer/orders"
          className="px-4 py-2 bg-gray-100 border border-gray-300 text-gray-800 rounded-md hover:bg-gray-200 transition"
        >
          View My Orders
        </Link>

        <Link
          locale={locale}
          href="/"
          className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-gray-800 transition"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
