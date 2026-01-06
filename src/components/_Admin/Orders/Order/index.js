"use client";

import { useEffect, useState, useMemo } from "react";
import { db } from "@/lib/firebaseClient";
import {
  doc,
  getDoc,
  updateDoc,
  increment
} from "firebase/firestore";
import { useParams } from "next/navigation";

import StatusBadge from "../StatusBadge";
import OrderTimeline from "../OrderTimeline";
import TrackingLinks from "../TrackingLinks";
import { useTranslations, useLocale } from "next-intl";

/* ============================================================
   DEDUCT STOCK
============================================================ */
async function deductStock(order) {
  if (order.stockDeducted) return { ok: true };

  for (const item of order.items) {
    const ref = doc(db, "products_dynamic", item.productId);
    const snap = await getDoc(ref);

    if (!snap.exists())
      return { ok: false, error: `Product not found: ${item.productId}` };

    const product = snap.data();
    const variants = product.variants || [];

    // find variant
    const match = variants.find(
      (v) =>
        v.color?.toLowerCase() === item.variant.color?.toLowerCase() &&
        (v.size?.toLowerCase() || "") ===
          (item.variant.size?.toLowerCase() || "")
    );

    if (!match)
      return { ok: false, error: `Variant not found: ${item.variant.color} ${item.variant.size || ""}` };

    if (match.quantity < item.qty)
      return {
        ok: false,
        error: `Not enough stock for ${item.title}. Required: ${item.qty}, Available: ${match.quantity}`
      };
  }

  // deduct
  for (const item of order.items) {
    const ref = doc(db, "products_dynamic", item.productId);
    const snap = await getDoc(ref);
    const product = snap.data();

    const updatedVariants = product.variants.map((v) => {
      if (
        v.color?.toLowerCase() === item.variant.color?.toLowerCase() &&
        (v.size?.toLowerCase() || "") ===
          (item.variant.size?.toLowerCase() || "")
      ) {
        return { ...v, quantity: v.quantity - item.qty };
      }
      return v;
    });

    await updateDoc(ref, { variants: updatedVariants });
  }

  return { ok: true };
}

/* ============================================================
   MAIN PAGE
============================================================ */
export default function OrderDetailsPage() {
  const { id } = useParams();
  const t = useTranslations("Order");
  const locale = useLocale();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [order, setOrder] = useState(null);

  const [status, setStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [tracking, setTracking] = useState("");
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState([]);
  const [stockInfo, setStockInfo] = useState([]); // NEW
  const [insufficient, setInsufficient] = useState([]);

  const [shipping, setShipping] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ============================================================
     TOTAL
============================================================ */
  const total = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.qty),
      0
    );
  }, [items]);

  /* ============================================================
     FETCH STOCK FOR EACH ITEM
============================================================ */
  async function loadStockInfo(currentItems = items) {
    const info = [];
    const insufficientList = [];

    for (let i = 0; i < currentItems.length; i++) {
      const item = currentItems[i];
      const ref = doc(db, "products_dynamic", item.productId);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        info.push({ available: 0 });
        insufficientList.push(i);
        continue;
      }

      const product = snap.data();
      const variants = product.variants || [];

      const match = variants.find(
        (v) =>
          v.color?.toLowerCase() === item.variant.color?.toLowerCase() &&
          (v.size?.toLowerCase() || "") ===
            (item.variant.size?.toLowerCase() || "")
      );

      if (!match) {
        info.push({ available: 0 });
        insufficientList.push(i);
        continue;
      }

      const available = match.quantity;
      info.push({ available });

      if (available < item.qty) insufficientList.push(i);
    }

    setStockInfo(info);
    setInsufficient(insufficientList);

    return info;
  }

  /* ============================================================
     AUTO-ADJUST QTY TO MAX AVAILABLE
============================================================ */
  async function autoAdjustQty(index) {
    const available = stockInfo[index]?.available ?? 0;
    if (available <= 0) return;

    const updated = [...items];
    updated[index].qty = available;
    setItems(updated);
    await loadStockInfo(updated);
  }

  /* ============================================================
     RESTOCK ITEM (ADMIN ACTION)
============================================================ */
  async function restockItem(index, amount = 1) {
    const item = items[index];

    const ref = doc(db, "products_dynamic", item.productId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const product = snap.data();

    const updatedVariants = product.variants.map((v) => {
      if (
        v.color?.toLowerCase() === item.variant.color?.toLowerCase() &&
        (v.size?.toLowerCase() || "") ===
          (item.variant.size?.toLowerCase() || "")
      ) {
        return { ...v, quantity: Number(v.quantity) + Number(amount) };
      }
      return v;
    });

    await updateDoc(ref, { variants: updatedVariants });

    await loadStockInfo(items);
  }

  /* ============================================================
     LOAD ORDER
============================================================ */
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
      setItems(data.items || []);

      setShipping({
        fullName: data.address?.fullName || "",
        phone: data.address?.phone || "",
        street: data.address?.street || "",
        city: data.address?.city || "",
        state: data.address?.state || "",
        country: data.address?.country || "",
        zip: data.address?.zip || ""
      });

      setLoading(false);

      await loadStockInfo(data.items || []);
    };

    load();
  }, [id]);

  /* ============================================================
     UPDATE QUANTITY
============================================================ */
  const updateQty = async (index, qty) => {
    if (qty < 1) qty = 1;

    const updated = [...items];
    updated[index].qty = qty;

    setItems(updated);
    await loadStockInfo(updated);
  };

  /* ============================================================
     REMOVE ITEM
============================================================ */
  const removeItem = async (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    await loadStockInfo(updated);
  };

  /* ============================================================
     SAVE ORDER
============================================================ */
  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    // re-check stock
    const info = await loadStockInfo();

    const wantsDeduction =
      status.toLowerCase() === "shipped" ||
      status.toLowerCase() === "completed";

    if (wantsDeduction && insufficient.length > 0) {
      setError(t("insufficientStockError"));
      setSaving(false);
      return;
    }

    if (wantsDeduction && !order.stockDeducted) {
      const result = await deductStock({ ...order, items });
      if (!result.ok) {
        setError(result.error);
        setSaving(false);
        return;
      }
    }

    try {
      const ref = doc(db, "orders", id);

      const activity = {
        message: t("activityUpdated"),
        detail: `${order.status} → ${status}`,
        at: new Date(),
        admin: "admin"
      };

      await updateDoc(ref, {
        status,
        paymentMethod,
        trackingNumber: tracking,
        notes,
        items,
        total,
        address: shipping,
        updatedAt: new Date(),
        stockDeducted:
          wantsDeduction ? true : order.stockDeducted || false,
        activities: [...(order.activities || []), activity]
      });

      setSuccess(t("saved"));
      setTimeout(() => setSuccess(""), 1500);

    } catch (err) {
      console.error(err);
      setError(t("saveError"));
    }

    setSaving(false);
  };

  /* ============================================================
     UI
============================================================ */
  if (loading) return <p>{t("loading")}...</p>;
  if (!order) return <p className="text-red-500">{t("notFound")}</p>;

  return (
    <div className="space-y-6">

      {/* ========================= CUSTOMER PANEL ========================= */}
      <div className="bg-white shadow p-6 rounded-xl border space-y-4">
        <h1 className="text-2xl font-bold">{t("title")}</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p><b>{t("customer")}:</b> {shipping.fullName}</p>
            <p><b>{t("phone")}:</b> {shipping.phone}</p>
            <p><b>{t("address")}:</b> {shipping.street}, {shipping.city}</p>
            <p><b>{t("country")}:</b> {shipping.country}</p>
          </div>

          <div className="flex flex-col justify-center">
            <a
              href={`https://wa.me/${shipping.phone}?text=Hello ${shipping.fullName}, regarding your order #${id}`}
              target="_blank"
              className="px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-center"
            >
              {t("whatsapp")}
            </a>
          </div>
        </div>
      </div>


      {/* ========================= SUMMARY ========================= */}
      <div className="bg-white shadow p-6 rounded-xl border space-y-4">

        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">{success}</p>}

        <h2 className="text-xl font-semibold">{t("summary")}</h2>
        <p><b>{t("orderId")}:</b> {id}</p>
        <p><b>{t("total")}:</b> ${total}</p>

        <OrderTimeline status={status} />

        <div>
          <label>{t("status")}</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded px-4 py-2 mt-1"
          >
            <option value="pending">{t("st_pending")}</option>
            <option value="paid">{t("st_paid")}</option>
            <option value="shipped">{t("st_shipped")}</option>
            <option value="completed">{t("st_completed")}</option>
            <option value="cancelled">{t("st_cancelled")}</option>
          </select>
        </div>

        <div>
          <label>{t("payment")}</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full border rounded px-4 py-2 mt-1"
          >
            <option value="COD">{t("pay_cod")}</option>
            <option value="Card">{t("pay_card")}</option>
          </select>
        </div>

        <div>
          <label>{t("tracking")}</label>
          <input
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            className="w-full border rounded px-4 py-2 mt-1"
          />
          <TrackingLinks tracking={tracking} />
        </div>

        <div>
          <label>{t("notes")}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border rounded px-4 py-2 mt-1 h-20"
          />
        </div>
      </div>


      {/* ========================= ITEMS ========================= */}
      <div className="bg-white shadow p-6 rounded-xl border space-y-4">
        <h2 className="text-xl font-semibold">{t("items")}</h2>

        {insufficient.length > 0 && (
          <div className="bg-red-100 text-red-700 border border-red-400 px-4 py-3 rounded">
            {t("insufficientWarning")}
          </div>
        )}

        {items.map((item, index) => {
          const stock = stockInfo[index]?.available ?? 0;
          const low = insufficient.includes(index);

          return (
            <div
              key={index}
              className={`border p-4 rounded-lg space-y-2 ${
                low ? "border-red-500 bg-red-50" : "border-gray-300 bg-gray-50"
              }`}
            >
              <p className="font-bold">{item.title}</p>
              <p className="text-gray-700">
                {t("color")}: {item.variant.color}
                {item.variant.size && <> | {t("size")}: {item.variant.size}</>}
              </p>

              {/* LIVE STOCK */}
              <p className="text-sm">
                <b>{t("stock")}:</b>{" "}
                {stock > 0 ? (
                  <span className="text-green-600">{stock} {t("available")}</span>
                ) : (
                  <span className="text-red-600">{t("outOfStock")}</span>
                )}
              </p>

              {/* QTY EDIT */}
              <div className="flex items-center gap-3 mt-2">
                <label>{t("qty")}</label>

                <input
                  type="number"
                  min="1"
                  value={item.qty}
                  onChange={(e) => updateQty(index, Number(e.target.value))}
                  className="w-20 border rounded px-2 py-1"
                />

                {/* AUTO-ADJUST */}
                {low && stock > 0 && (
                  <button
                    onClick={() => autoAdjustQty(index)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {t("adjust")}
                  </button>
                )}

                {/* RESTOCK */}
                <button
                  onClick={() => restockItem(index, 1)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  {t("restock")}
                </button>

                {/* REMOVE ITEM */}
                <button
                  onClick={() => removeItem(index)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  {t("removeItem")}
                </button>
              </div>

              <p className="font-semibold">
                {t("subtotal")}: ${item.qty * item.price}
              </p>
            </div>
          );
        })}
      </div>

      {/* SAVE BUTTON */}
      <button
        onClick={handleSave}
        className="w-full py-3 bg-neutral-900 text-white rounded-lg text-lg hover:bg-gray-800"
      >
        {saving ? t("saving") : t("save")}
      </button>
    </div>
  );
}
