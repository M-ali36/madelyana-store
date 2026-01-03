"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseClient";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "next/navigation";

export default function InvoicePage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "orders", id));
      if (snap.exists()) {
        setOrder({ id, ...snap.data() });
      }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <p className="p-6 text-gray-500">Loading invoice…</p>;
  if (!order) return <p className="p-6 text-red-600">Order not found.</p>;

  const isRefunded = order.paymentStatus === "Refunded";

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-sm rounded-lg print:shadow-none print:p-0">

      {/* Print + PDF */}

      <div className="flex justify-end gap-3 mb-4 print:hidden">
        <button
          className="px-4 py-2 bg-neutral-900 text-white rounded hover:bg-gray-800"
          onClick={() => window.print()}
        >
          Print Invoice
        </button>

        <button
          onClick={() => window.open(`/api/invoice/${order.id}`, "_blank")}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          Download PDF
        </button>
      </div>

      {/* REFUNDED BANNER */}
      {isRefunded && (
        <div className="p-4 mb-6 bg-red-100 border border-red-300 rounded text-red-700 font-semibold">
          ⚠️ This order has been fully refunded.
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start border-b pb-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">INVOICE</h1>
          <p className="text-gray-600 mt-2">Order #{order.id}</p>
          <p className="text-gray-600 text-sm mt-1">
            {order.createdAt?.toDate
              ? order.createdAt.toDate().toLocaleString()
              : ""}
          </p>

          {/* Refund status */}
          <p className="text-gray-700 text-sm mt-1">
            <b>Status:</b> {order.status}
          </p>
          {isRefunded && (
            <p className="text-red-600 font-semibold text-sm">Payment Refunded</p>
          )}
        </div>

        <div className="text-right">
          <h2 className="font-semibold text-lg">STORE NAME</h2>
          <p className="text-gray-600 text-sm">123 Street</p>
          <p className="text-gray-600 text-sm">City, Country</p>
          <p className="text-gray-600 text-sm">support@store.com</p>
        </div>
      </div>

      {/* Billing + Shipping */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border p-4 rounded">
          <h3 className="font-semibold mb-2">Billing Details</h3>
          <p><b>Email:</b> {order.userEmail}</p>
        </div>

        <div className="border p-4 rounded">
          <h3 className="font-semibold mb-2">Shipping Details</h3>
          <p><b>Name:</b> {order.shipping?.name}</p>
          <p><b>Phone:</b> {order.shipping?.phone}</p>
          <p><b>Address:</b> {order.shipping?.address}</p>
          <p><b>City:</b> {order.shipping?.city}</p>
          <p><b>Country:</b> {order.shipping?.country}</p>
          <p><b>Zip:</b> {order.shipping?.zip}</p>
        </div>
      </div>

      {/* Items */}
      <div className="border rounded">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-2">Product</th>
              <th className="px-4 py-2">Variant</th>
              <th className="px-4 py-2">Qty</th>
              <th className="px-4 py-2">Unit Price</th>
              <th className="px-4 py-2">Total</th>
              {isRefunded && <th className="px-4 py-2">Refund</th>}
            </tr>
          </thead>

          <tbody>
            {order.items.map((item, i) => (
              <tr key={i} className="border-b">
                <td className="px-4 py-3">{item.name}</td>

                <td className="px-4 py-3 text-gray-600">
                  {item.variant.color} / {item.variant.size}
                </td>

                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3">${item.price}</td>

                <td className="px-4 py-3">
                  ${(item.price * item.quantity).toFixed(2)}
                </td>

                {isRefunded && (
                  <td className="px-4 py-3 text-red-600 font-semibold">
                    Refunded
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mt-6 flex justify-end">
        <div className="text-right">

          {isRefunded && (
            <p className="text-red-600 font-semibold text-lg mb-2">
              ⚠️ All amounts refunded
            </p>
          )}

          <p className="text-lg">
            <b>Subtotal:</b> ${order.total.toFixed(2)}
          </p>
          <p className="text-lg">
            <b>Shipping:</b> ${order.shippingCost || 0}
          </p>
          <p className="text-xl font-semibold mt-2">
            Total: ${order.total.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm mt-10">
        Thank you for your purchase!
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
          button {
            display: none;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
