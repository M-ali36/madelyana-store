// app/customer/orders/[id]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { auth, db } from "@/lib/firebaseClient";
import { doc, getDoc } from "firebase/firestore";
import Link from "@/components/Ui/Link";
import useCurrency from "@/components/hooks/useCurrency";
import { useLocale } from "next-intl";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const { format } = useCurrency();
  const locale = useLocale();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // -------------------------------------------------------
  // Fetch order
  // -------------------------------------------------------
  useEffect(() => {
    async function fetchOrder() {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const ref = doc(db, "orders", id);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        setOrder(null);
        setLoading(false);
        return;
      }

      const data = snap.data();

      // Prevent unauthorized access
      if (data.userId !== currentUser.uid) {
        setOrder("unauthorized");
      } else {
        setOrder(data);
      }

      setLoading(false);
    }

    fetchOrder();
  }, [id]);

  // -------------------------------------------------------
  // UI Guards
  // -------------------------------------------------------
  if (loading) return <div className="text-gray-600">Loading order...</div>;
  if (order === null) return <div className="text-red-600">Order not found.</div>;
  if (order === "unauthorized")
    return <div className="text-red-600">You cannot view this order.</div>;

  const orderDate = order.createdAt?.toDate
    ? order.createdAt.toDate().toLocaleString()
    : "—";

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const statusTag = statusColors[order.status] || "bg-gray-100 text-gray-700";

  return (
    <div className="max-w-4xl mx-auto py-6">
      {/* Back Button */}
      <Link locale={locale} href="/customer/orders" className="text-sm text-gray-600 hover:underline">
        ← Back to Orders
      </Link>

      {/* Order Header */}
      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Order #{id}</h1>

        <div className="flex items-center gap-3 mt-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusTag}`}>
            {order.status}
          </span>
          <span className="text-sm text-gray-600">Placed on {orderDate}</span>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Items</h2>

        <div className="space-y-6">
          {order.items?.map((item) => (
            <OrderItem key={item.variantId} item={item} format={format} />
          ))}
        </div>

        {/* Totals */}
        <div className="border-t pt-4 mt-6 text-sm text-gray-700">
          <div className="flex justify-between mb-1">
            <span>Subtotal:</span>
            <span>{format(order.subtotal)}</span>
          </div>

          <div className="flex justify-between mb-1">
            <span>Shipping:</span>
            <span>{format(order.shipping)}</span>
          </div>

          <div className="flex justify-between font-semibold text-gray-900 text-base mt-2">
            <span>Total:</span>
            <span>{format(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white border rounded-lg p-6 shadow-sm mt-6">
        <h2 className="text-lg font-semibold mb-3">Shipping Address</h2>

        {order.address ? (
          <div className="text-sm leading-relaxed text-gray-700">
            <p>{order.address.fullName}</p>
            <p>{order.address.phone}</p>
            <p>{order.address.street}</p>
            <p>
              {order.address.city} {order.address.state || ""}
            </p>
            <p>{order.address.country}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No address provided.</p>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------
// Order Item Component – FULL PRODUCT DETAILS
// -------------------------------------------------------
function OrderItem({ item, format }) {
  const locale = useLocale();
  const attrs = item.variant || {};

  return (
    <div className="flex gap-4 border-b pb-4">
      {/* Thumbnail */}
      <img
        src={item.image || "/placeholder.webp"}
        alt={item.title}
        className="w-20 h-20 rounded-md object-cover border"
      />

      <div className="flex-1">
        {/* TITLE */}
        <h3 className="font-medium text-gray-800 mb-1">
          <Link locale={locale} href={`/${item.slug || "#"}`} className="hover:underline">
            {item.title}
          </Link>
        </h3>

        {/* VARIANTS / SELECTED ATTRIBUTES */}
        <div className="space-y-1 text-xs text-gray-700">
          {Object.entries(attrs).map(([key, value]) => {
            if (!value) return null;

            const lowerKey = key.toLowerCase();
            const isColor = lowerKey === "color" || lowerKey === "colour";

            return (
              <div key={key} className="flex items-center gap-2">
                <span className="capitalize">{key}:</span>

                {isColor ? (
                  <>
                    {/* Color Bubble */}
                    <span
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: value.toLowerCase() }}
                    />
                    <span className="capitalize">{value}</span>
                  </>
                ) : (
                  // Other attributes badge
                  <span className="px-2 py-0.5 bg-gray-100 border rounded capitalize">
                    {value}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* PRICE DETAILS */}
        <div className="mt-3 text-sm text-gray-700">
          <p>Quantity: {item.qty}</p>
          <p>Unit Price: {format(item.price)}</p>
          <p className="font-semibold mt-1">
            Line Total: {format(item.qty * item.price)}
          </p>
        </div>
      </div>
    </div>
  );
}
