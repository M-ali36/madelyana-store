// app/customer/orders/page.jsx
"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebaseClient";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import Link from "@/components/Ui/Link";
import useCurrency from "@/components/hooks/useCurrency";
import { useLocale } from "next-intl";

export default function CustomerOrdersPage() {
  const locale = useLocale();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 NEW: currency formatter from AppContext
   const { format } = useCurrency();

  useEffect(() => {
    const fetchOrders = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const ref = collection(db, "orders");
      const q = query(
          collection(db, "orders"),
          where("userId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
      );

      const snap = await getDocs(q);

      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log(JSON.stringify(list));

      setOrders(list);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  // -------------------------------------------------------
  // UI: Loading
  // -------------------------------------------------------
  if (loading) {
    return <div className="text-gray-600">Loading your orders...</div>;
  }

  // -------------------------------------------------------
  // UI: No orders
  // -------------------------------------------------------
  if (orders.length === 0) {
    return (
      <div className="text-center text-gray-600 mt-10">
        <p>You have no orders yet.</p>

        <Link
          href="/"
          locale={locale} 
          className="inline-block mt-4 px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-gray-800 transition"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  // -------------------------------------------------------
  // UI: Orders List
  // -------------------------------------------------------
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Your Orders
      </h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} format={format} />
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------
// Order Card Component
// -------------------------------------------------------
function OrderCard({ order, format }) {
  const locale = useLocale();
  const createdDate = order.createdAt?.toDate
  ? order.createdAt.toDate().toLocaleString()
  : "—";

  const statusColor = {
    pending: "bg-yellow-100 text-yellow-700",
    paid: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
  }[order.status] || "bg-gray-100 text-gray-700";

  const itemCount = order.items?.length || 0;

  return (
    <Link
      href={`/customer/orders/${order.id}`}
      locale={locale} 
      className="block bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition"
    >
      {/* Top row */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-gray-800">Order #{order.id}</h2>

        <span
          className={`px-3 py-1 text-xs rounded-full font-medium ${statusColor}`}
        >
          {order.status}
        </span>
      </div>

      {/* Order details */}
      <div className="text-sm text-gray-600 space-y-1">
        <p>
          <strong>Date:</strong> {createdDate}
        </p>
        <p>
          <strong>Items:</strong> {itemCount}
        </p>
        <p>
          <strong>Total:</strong> {format(order.total)}
        </p>
      </div>

      {/* Link hint */}
      <p className="mt-4 text-sm text-neutral-900 hover:underline">
        View Order Details →
      </p>
    </Link>
  );
}
