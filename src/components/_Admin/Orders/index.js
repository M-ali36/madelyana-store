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
import { useLocale } from "next-intl";

export default function OrdersPage() {
  const PAGE_SIZE = 10;
  const locale = useLocale();

  const [orders, setOrders] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [totalOrders, setTotalOrders] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  // Bulk select
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [bulkAction, setBulkAction] = useState("");
  const [reason, setReason] = useState("");
  const [savingBulk, setSavingBulk] = useState(false);

  // -------------------------
  // FETCH COUNT
  // -------------------------
  const fetchTotalCount = async () => {
    const snapshot = await getCountFromServer(collection(db, "orders"));
    setTotalOrders(snapshot.data().count);
  };

  // -------------------------
  // INITIAL LOAD
  // -------------------------
  const fetchOrders = async () => {
    setLoading(true);

    try {
      const q = buildQuery();
      const snap = await getDocs(q);

      const docs = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setOrders(docs);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setSelected([]);
    } catch (err) {
      console.error("Error loading orders:", err);
    }

    setLoading(false);
  };

  // -------------------------
  // LOAD MORE
  // -------------------------
  const loadMore = async () => {
    if (!lastDoc) return;

    setLoadingMore(true);
    try {
      const q = buildQuery(true);
      const snap = await getDocs(q);

      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOrders((prev) => [...prev, ...docs]);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
    } catch (err) {
      console.error(err);
    }

    setLoadingMore(false);
  };

  // -------------------------
  // BUILD QUERY
  // -------------------------
  const buildQuery = (isLoadMore = false) => {
    const sortField = "createdAt";
    const sortDirection = sortOrder === "newest" ? "desc" : "asc";

    let constraints = [orderBy(sortField, sortDirection), limit(PAGE_SIZE)];

    // Status Filter
    if (statusFilter !== "") {
      constraints.push(where("status", "==", statusFilter));
    }

    // Payment Filter (you only have paymentMethod, not paymentStatus)
    if (paymentFilter !== "") {
      constraints.push(where("paymentMethod", "==", paymentFilter));
    }

    let q = query(collection(db, "orders"), ...constraints);

    if (isLoadMore && lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    return q;
  };

  // -------------------------
  // SEARCH FILTER (Client)
  // -------------------------
  const searched = orders.filter((order) => {
    const text = `
      ${order.id}
      ${order.address?.fullName || ""}
      ${order.status}
      ${order.paymentMethod}
      ${order.total}
    `.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  useEffect(() => {
    fetchTotalCount();
    fetchOrders();
  }, [statusFilter, paymentFilter, sortOrder]);

  // -------------------------
  // BULK ACTIONS
  // -------------------------
  const openBulkModal = (action) => {
    setBulkAction(action);
    setReason("");
    setShowModal(true);
  };

  const applyBulkAction = async () => {
    setSavingBulk(true);
    try {
      for (const orderId of selected) {
        const ref = doc(db, "orders", orderId);

        const activity = {
          message: `Bulk update → Status changed to '${bulkAction}'`,
          detail: reason ? `Reason: ${reason}` : "",
          at: new Date(),
          admin: "admin",
        };

        await updateDoc(ref, {
          status: bulkAction,
          updatedAt: new Date(),
          activities: [
            ...(orders.find((o) => o.id === orderId)?.activities || []),
            activity,
          ],
        });
      }

      setShowModal(false);
      fetchOrders();
    } catch (err) {
      console.error("Bulk update error:", err);
      alert("Error performing bulk action.");
    }

    setSavingBulk(false);
  };

  // -------------------------
  // SELECT CHECKBOXES
  // -------------------------
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === searched.length) setSelected([]);
    else setSelected(searched.map((o) => o.id));
  };

  // -------------------------
  // RENDER
  // -------------------------
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <button
          onClick={() => exportCSV()}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Export CSV
        </button>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">

        <input
          type="text"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-md"
        />

        {/* Order Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="shipped">Shipped</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {/* Payment Method */}
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">All Payments</option>
          <option value="COD">Cash on Delivery</option>
          <option value="Card">Card</option>
        </select>

        {/* Sort */}
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>

      </div>

      {/* BULK ACTION BAR */}
      {selected.length > 0 && (
        <div className="bg-gray-100 border rounded-lg p-3 flex items-center justify-between">
          <p className="text-sm font-medium">Selected: {selected.length}</p>

          <div className="flex gap-2">
            <button onClick={() => openBulkModal("paid")} className="px-3 py-1 bg-blue-600 text-white rounded">
              Mark Paid
            </button>

            <button onClick={() => openBulkModal("shipped")} className="px-3 py-1 bg-purple-600 text-white rounded">
              Mark Shipped
            </button>

            <button onClick={() => openBulkModal("completed")} className="px-3 py-1 bg-green-600 text-white rounded">
              Mark Completed
            </button>

            <button onClick={() => openBulkModal("cancelled")} className="px-3 py-1 bg-red-600 text-white rounded">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white border rounded-xl shadow-card overflow-hidden">

        {loading ? (
          <p className="p-6 text-gray-500">Loading…</p>
        ) : searched.length === 0 ? (
          <p className="p-6 text-gray-500">No orders found.</p>
        ) : (
          <table className="w-full">

            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.length === searched.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {searched.map((order) => {
                return (
                  <tr key={order.id} className="border-t">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(order.id)}
                        onChange={() => toggleSelect(order.id)}
                      />
                    </td>

                    {/* Order ID */}
                    <td className="px-4 py-3 font-medium">{order.id}</td>

                    {/* Customer */}
                    <td className="px-4 py-3">
                      {order.address?.fullName || "Unknown"}
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3 font-semibold">
                      ${Number(order.total || 0).toFixed(2)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>

                    {/* Payment */}
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">
                        {order.paymentMethod || "COD"}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3">
                      {order.createdAt?.toDate
                        ? order.createdAt.toDate().toLocaleString()
                        : new Date(order.createdAt.seconds * 1000).toLocaleString()}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${order.id}`} locale={locale} className="text-primary hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>

          </table>
        )}
      </div>

      {/* LOAD MORE */}
      {lastDoc && (
        <div className="flex justify-center pt-4">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-900"
          >
            {loadingMore ? "Loading…" : "Load More"}
          </button>
        </div>
      )}

      {/* BULK ACTION MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirm Bulk Action</h2>

            <p className="text-gray-700 mb-2">
              You are about to update <b>{selected.length}</b> order(s)
            </p>

            <p className="text-primary text-lg mb-4">
              New Status: <b>{bulkAction}</b>
            </p>

            <label className="font-medium">Reason (optional)</label>
            <textarea
              className="w-full border rounded px-3 py-2 mt-1 h-20"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={applyBulkAction}
                className="px-4 py-2 bg-black text-white rounded"
              >
                {savingBulk ? "Saving…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
