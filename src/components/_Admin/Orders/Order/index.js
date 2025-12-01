"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseClient";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams } from "next/navigation";

import StatusBadge from "../StatusBadge";
import OrderTimeline from "../OrderTimeline";
import TrackingLinks from "../TrackingLinks";

// --------------------------------------------
// STOCK DEDUCTION LOGIC
// --------------------------------------------
async function deductStockForOrder(order) {
  if (order.stockDeducted) {
    return { ok: true, message: "Stock already deducted" };
  }

  const items = order.items || [];

  // First pass — validate
  for (const item of items) {
    const productRef = doc(db, "products_dynamic", item.productId);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
      return { ok: false, error: `Product not found: ${item.productId}` };
    }

    const product = productSnap.data();
    const variants = product.variants || [];

    const variantMatch = variants.find(
      (v) => v.color === item.variant.color && v.size === item.variant.size
    );

    if (!variantMatch) {
      return {
        ok: false,
        error: `Variant not found: ${item.variant.color}/${item.variant.size}`,
      };
    }

    if (variantMatch.quantity < item.quantity) {
      return {
        ok: false,
        error: `Insufficient stock for ${item.name} (${item.variant.color}/${item.variant.size}) — Requested ${item.quantity}, Available ${variantMatch.quantity}`,
      };
    }
  }

  // Second pass — deduct
  for (const item of items) {
    const productRef = doc(db, "products_dynamic", item.productId);
    const productSnap = await getDoc(productRef);
    const product = productSnap.data();

    const updatedVariants = product.variants.map((v) => {
      if (v.color === item.variant.color && v.size === item.variant.size) {
        return { ...v, quantity: v.quantity - item.quantity };
      }
      return v;
    });

    await updateDoc(productRef, { variants: updatedVariants });
  }

  return { ok: true };
}

export default function OrderDetailsPage() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [order, setOrder] = useState(null);

  // Editable fields
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [tracking, setTracking] = useState("");
  const [notes, setNotes] = useState("");
  const [refundReason, setRefundReason] = useState("");

  const [shipping, setShipping] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    zip: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load order
  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "orders", id));
      if (!snap.exists()) return;

      const data = snap.data();
      setOrder(data);

      setStatus(data.status);
      setPaymentStatus(data.paymentStatus || "Pending");
      setTracking(data.trackingNumber || "");
      setNotes(data.notes || "");
      setRefundReason(data.refundReason || "");

      setShipping({
        name: data.shipping?.name || "",
        phone: data.shipping?.phone || "",
        address: data.shipping?.address || "",
        city: data.shipping?.city || "",
        country: data.shipping?.country || "",
        zip: data.shipping?.zip || "",
      });

      setLoading(false);
    };

    load();
  }, [id]);

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    const mustDeduct =
      status === "Completed" &&
      paymentStatus === "Paid" &&
      !order.stockDeducted;

    if (mustDeduct) {
      const result = await deductStockForOrder(order);

      if (!result.ok) {
        setError(result.error);
        setSaving(false);
        return;
      }
    }

    try {
      const ref = doc(db, "orders", id);

      const updatedActivity = {
        message:
          paymentStatus === "Refunded"
            ? "Order refunded"
            : "Order updated",
        detail:
          paymentStatus === "Refunded"
            ? `Refund Reason: ${refundReason || "(none provided)"}`
            : `Status: ${order.status} → ${status}, Payment: ${order.paymentStatus} → ${paymentStatus}`,
        at: new Date(),
        admin: "admin",
      };

      await updateDoc(ref, {
        status,
        paymentStatus,
        trackingNumber: tracking,
        notes,
        refundReason: paymentStatus === "Refunded" ? refundReason : null,
        shipping,
        updatedAt: new Date(),
        stockDeducted: mustDeduct ? true : order.stockDeducted || false,

        activities: [...(order.activities || []), updatedActivity],
      });

      setSuccess("Order updated!");
      setTimeout(() => setSuccess(""), 1200);
    } catch (err) {
      console.error(err);
      setError("Error updating order");
    }

    setSaving(false);
  };

  if (loading) return <p>Loading…</p>;
  if (!order) return <p className="text-red-500">Order not found</p>;

  const isRefunded = paymentStatus === "Refunded";

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold">Order Details</h1>

        <a
          href={`/admin/orders/${id}/invoice`}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Print Invoice
        </a>
      </div>

      <div className="bg-white border rounded-xl shadow-card p-6 space-y-6">

        {/* Notifications */}
        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">{success}</p>}

        {/* Summary */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Order Summary</h2>
          <p><b>Order ID:</b> {id}</p>
          <p><b>Email:</b> {order.userEmail}</p>
          <p><b>Total:</b> ${order.total}</p>
          <p><b>Status:</b> <StatusBadge status={order.status} /></p>
          <p><b>Payment:</b> {order.paymentStatus}</p>
        </div>

        {/* Refund Reason Banner */}
        {isRefunded && (
          <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded">
            <b>Refunded:</b> {refundReason || "No reason provided"}
          </div>
        )}

        {/* Timeline */}
        <OrderTimeline status={status} />

        {/* Order Status */}
        <div>
          <label className="font-medium">Order Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border px-4 py-2 rounded mt-1"
          >
            <option>Pending</option>
            <option>Paid</option>
            <option>Shipped</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>
        </div>

        {/* Payment Status */}
        <div>
          <label className="font-medium">Payment Status</label>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="w-full border px-4 py-2 rounded mt-1"
          >
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Refunded">Refunded</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        {/* Refund Reason */}
        {paymentStatus === "Refunded" && (
          <div>
            <label className="font-medium">Refund Reason</label>
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              className="w-full border px-4 py-2 rounded mt-1 h-20"
              placeholder="Explain why the refund was issued…"
            />
          </div>
        )}

        {/* Tracking */}
        <div>
          <label className="font-medium">Tracking Number</label>
          <input
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            className="w-full border px-4 py-2 rounded mt-1"
          />
          <TrackingLinks tracking={tracking} />
        </div>

        {/* Notes */}
        <div>
          <label className="font-medium">Admin Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border px-4 py-2 rounded mt-1 h-20"
          />
        </div>

        {/* Shipping */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Shipping Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["name", "phone", "address", "city", "country", "zip"].map((f) => (
              <div key={f}>
                <label className="font-medium capitalize">{f}</label>
                <input
                  value={shipping[f]}
                  onChange={(e) =>
                    setShipping({ ...shipping, [f]: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded mt-1"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Items */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Items</h3>
          <div className="bg-gray-50 p-4 rounded border space-y-4">
            {order.items.map((item, i) => (
              <div key={i} className="border-b pb-3">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-700">
                  {item.variant.color} / {item.variant.size}
                </p>
                <p>Qty: {item.quantity}</p>
                <p>${item.price} each</p>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Log */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Activity Log</h3>

          <div className="bg-gray-50 border rounded p-4 space-y-2">
            {order.activities?.length ? (
              order.activities.map((a, i) => (
                <div key={i} className="text-sm">
                  <p className="font-semibold">{a.message}</p>
                  <p className="text-gray-700 text-sm">{a.detail}</p>
                  <p className="text-gray-600 text-xs">
                    {a.at.seconds
                      ? new Date(a.at.seconds * 1000).toLocaleString()
                      : new Date(a.at).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No activity yet</p>
            )}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full mt-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>

      </div>
    </div>
  );
}
