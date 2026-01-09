"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getCountFromServer,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import Link from "@/components/Ui/Link";
import StatusBadge from "./StatusBadge";
import { useLocale, useTranslations } from "next-intl";

export default function OrdersPage() {
  const PAGE_SIZE = 10;
  const locale = useLocale();
  const t = useTranslations("admin.orders");

  const [orders, setOrders] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  // Bulk
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [bulkAction, setBulkAction] = useState("");
  const [reason, setReason] = useState("");
  const [savingBulk, setSavingBulk] = useState(false);

  // -------------------------
  // FETCH COUNT
  // -------------------------
  const fetchTotalCount = async () => {
    await getCountFromServer(collection(db, "orders"));
  };

  // -------------------------
  // BUILD QUERY
  // -------------------------
  const buildQuery = (isLoadMore = false) => {
    const direction = sortOrder === "newest" ? "desc" : "asc";
    let constraints = [orderBy("createdAt", direction), limit(PAGE_SIZE)];

    if (statusFilter) constraints.push(where("status", "==", statusFilter));
    if (paymentFilter)
      constraints.push(where("paymentMethod", "==", paymentFilter));

    let q = query(collection(db, "orders"), ...constraints);
    if (isLoadMore && lastDoc) q = query(q, startAfter(lastDoc));
    return q;
  };

  // -------------------------
  // LOAD
  // -------------------------
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(buildQuery());
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOrders(docs);
      setLastDoc(snap.docs.at(-1) || null);
      setSelected([]);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const loadMore = async () => {
    if (!lastDoc) return;
    setLoadingMore(true);
    try {
      const snap = await getDocs(buildQuery(true));
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOrders((prev) => [...prev, ...docs]);
      setLastDoc(snap.docs.at(-1) || null);
    } catch (err) {
      console.error(err);
    }
    setLoadingMore(false);
  };

  // -------------------------
  // SEARCH
  // -------------------------
  const searched = orders.filter((o) =>
    `
      ${o.id}
      ${o.address?.fullName || ""}
      ${o.status}
      ${o.paymentMethod}
      ${o.total}
    `
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  useEffect(() => {
    fetchTotalCount();
    fetchOrders();
  }, [statusFilter, paymentFilter, sortOrder]);

  // -------------------------
  // BULK
  // -------------------------
  const openBulkModal = (action) => {
    setBulkAction(action);
    setReason("");
    setShowModal(true);
  };

  const applyBulkAction = async () => {
    setSavingBulk(true);
    try {
      for (const id of selected) {
        await updateDoc(doc(db, "orders", id), {
          status: bulkAction,
          updatedAt: new Date(),
        });
      }
      setShowModal(false);
      fetchOrders();
    } catch (err) {
      alert(t("bulk.error"));
    }
    setSavingBulk(false);
  };

  const toggleSelect = (id) =>
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const toggleSelectAll = () =>
    setSelected(
      selected.length === searched.length ? [] : searched.map((o) => o.id)
    );

  // -------------------------
  // RENDER
  // -------------------------
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <input
          type="text"
          placeholder={t("search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-md border px-4 py-2"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border px-3 py-2"
        >
          <option value="">{t("filters.allStatus")}</option>
          <option value="pending">{t("status.pending")}</option>
          <option value="paid">{t("status.paid")}</option>
          <option value="shipped">{t("status.shipped")}</option>
          <option value="completed">{t("status.completed")}</option>
          <option value="cancelled">{t("status.cancelled")}</option>
        </select>

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="rounded-md border px-3 py-2"
        >
          <option value="">{t("filters.allPayments")}</option>
          <option value="COD">{t("payments.cod")}</option>
          <option value="Card">{t("payments.card")}</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="rounded-md border px-3 py-2"
        >
          <option value="newest">{t("sort.newest")}</option>
          <option value="oldest">{t("sort.oldest")}</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-card">
        {loading ? (
          <p className="p-6 text-gray-500">{t("loading")}</p>
        ) : searched.length === 0 ? (
          <p className="p-6 text-gray-500">{t("empty")}</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.length === searched.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-4 py-3">{t("table.order")}</th>
                <th className="px-4 py-3">{t("table.customer")}</th>
                <th className="px-4 py-3">{t("table.total")}</th>
                <th className="px-4 py-3">{t("table.status")}</th>
                <th className="px-4 py-3">{t("table.payment")}</th>
                <th className="px-4 py-3">{t("table.date")}</th>
                <th className="px-4 py-3">{t("table.actions")}</th>
              </tr>
            </thead>

            <tbody>
              {searched.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(o.id)}
                      onChange={() => toggleSelect(o.id)}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      locale={locale}
                      className="text-primary hover:underline"
                    >
                      {o.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {o.address?.fullName || t("unknown")}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    ${Number(o.total || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-gray-100 px-2 py-1 text-xs">
                      {o.paymentMethod || "COD"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {o.createdAt?.toDate
                      ? o.createdAt.toDate().toLocaleString()
                      : ""}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      locale={locale}
                      className="text-primary hover:underline"
                    >
                      {t("view")}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {lastDoc && (
        <div className="flex justify-center pt-4">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="rounded bg-neutral-900 px-4 py-2 text-white hover:bg-gray-900"
          >
            {loadingMore ? t("loading") : t("loadMore")}
          </button>
        </div>
      )}

      {/* BULK MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">
              {t("bulk.confirm")}
            </h2>

            <p className="mb-4 text-gray-700">
              {t("bulk.message", { count: selected.length })}
            </p>

            <textarea
              className="h-20 w-full rounded border px-3 py-2"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("bulk.reason")}
            />

            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded border px-4 py-2"
              >
                {t("cancel")}
              </button>

              <button
                onClick={applyBulkAction}
                className="rounded bg-neutral-900 px-4 py-2 text-white"
              >
                {savingBulk ? t("saving") : t("confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
