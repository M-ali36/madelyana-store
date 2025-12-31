"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseClient";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams } from "next/navigation";

import StatusBadge from "../StatusBadge";
import OrderTimeline from "../OrderTimeline";
import TrackingLinks from "../TrackingLinks";

// --------------------------------------------
// STOCK DEDUCTION LOGIC (corrected)
// --------------------------------------------
async function deductStockForOrder(order) {
  if (order.stockDeducted) {
    return { ok: true, message: "Stock already deducted" };
  }

  const items = order.items || [];

  // Validate stock
  for (const item of items) {
    const productRef = doc(db, "products_dynamic", item.productId);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
      return { ok: false, error: `Product not found: ${item.productId}` };
    }

    const product = productSnap.data();
    const variants = product.variants || [];

    // Your variant only has color, no size
    const variantMatch = variants.find((v) => v.color === item.variant.color);

    if (!variantMatch) {
      return {
        ok: false,
        error: `Variant not found: ${item.variant.color}`,
      };
    }

    if (variantMatch.quantity < item.qty) {
      return {
        ok: false,
        error: `Insufficient stock for ${item.title} (${item.variant.color}) — Requested ${item.qty}, Available ${variantMatch.quantity}`,
      };
    }
  }

  // Deduct stock
  for (const item of items) {
    const ref = doc(db, "products_dynamic", item.productId);
    const snap = await getDoc(ref);
    const product = snap.data();

    const updatedVariants = product.variants.map((v) => {
      if (v.color === item.variant.color) {
        return { ...v, quantity: v.quantity - item.qty };
      }
      return v;
    });

    await updateDoc(ref, { variants: updatedVariants });
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
  const [paymentMethod, setPaymentMethod] = useState("");
  const [tracking, setTracking] = useState("");
  const [notes, setNotes] = useState("");

  // Refunds do not exist in your schema BUT kept optional for future extension
  const [refundReason, setRefundReason] = useState("");

  // Shipping address (mapped from order.address)
  const [shipping, setShipping] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
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
      setPaymentMethod(data.paymentMethod || "COD");
      setTracking(data.trackingNumber || "");
      setNotes(data.notes || "");

      // Shipping = order.address
      setShipping({
        fullName: data.address?.fullName || "",
        phone: data.address?.phone || "",
        street: data.address?.street || "",
        city: data.address?.city || "",
        state: data.address?.state || "",
        country: data.address?.country || "",
        zip: data.address?.zip || "",
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

    const mustDeduct = status === "Completed" && !order.stockDeducted;

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
        message: "Order updated",
        detail: `Status: ${order.status} → ${status}`,
        at: new Date(),
        admin: "admin",
      };

      await updateDoc(ref, {
        status,
        paymentMethod,
        trackingNumber: tracking,
        notes,
        address: shipping,
        updatedAt: new Date(),
        stockDeducted: mustDeduct ? true : order.stockDeducted || false,
        activities: [...(order.activities || []), updatedActivity],
      });

      setSuccess("Order updated successfully!");
      setTimeout(() => setSuccess(""), 1200);
    } catch (err) {
      console.error(err);
      setError("Error updating order.");
    }

    setSaving(false);
  };

  if (loading) return <p>Loading…</p>;
  if (!order) return <p className="text-red-500">Order not found</p>;

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
          <p><b>Customer:</b> {shipping.fullName}</p>
          <p><b>Total:</b> ${order.total}</p>
          <p><b>Status:</b> <StatusBadge status={order.status} /></p>
          <p><b>Payment Method:</b> {order.paymentMethod}</p>
        </div>

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
            <option>pending</option>
            <option>paid</option>
            <option>shipped</option>
            <option>completed</option>
            <option>cancelled</option>
          </select>
        </div>

        {/* Payment Method */}
        <div>
          <label className="font-medium">Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full border px-4 py-2 rounded mt-1"
          >
            <option value="COD">Cash on Delivery</option>
            <option value="Card">Card</option>
          </select>
        </div>

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
            {Object.keys(shipping).map((field) => (
              <div key={field}>
                <label className="font-medium capitalize">{field}</label>
                <input
                  value={shipping[field]}
                  onChange={(e) =>
                    setShipping({ ...shipping, [field]: e.target.value })
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
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-gray-700">
                  Color: {item.variant.color}
                </p>
                <p>Qty: {item.qty}</p>
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
                  <p className="text-gray-700">{a.detail}</p>
                  <p className="text-gray-600 text-xs">
                    {a.at?.seconds
                      ? new Date(a.at.seconds * 1000).toLocaleString()
                      : new Date(a.at).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No activity yet.</p>
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
