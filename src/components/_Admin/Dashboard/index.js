"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  getCountFromServer,
  orderBy,
  limit,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { useTranslations } from "next-intl";

import {
  HiShoppingBag,
  HiUserGroup,
  HiCash,
  HiChartPie,
} from "react-icons/hi";
import { HiExclamationTriangle } from "react-icons/hi2";

import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

function parseDate(value) {
  if (!value) return null;

  if (typeof value.toDate === "function") return value.toDate();

  if (typeof value.seconds === "number")
    return new Date(value.seconds * 1000);

  if (typeof value === "number") return new Date(value);

  if (typeof value === "string") {
    const dt = new Date(value);
    if (!isNaN(dt)) return dt;
  }

  return null;
}

export default function AdminDashboard() {
  const t = useTranslations("Dashboard");
  const [dashboard, setDashboard] = useState(null);

  const loadDashboard = async () => {
    try {
      // ---------------- TOTAL USERS ----------------
      const usersCountSnap = await getCountFromServer(collection(db, "users"));
      const totalUsers = usersCountSnap.data().count;

      // ---------------- TOTAL ORDERS ----------------
      const ordersCountSnap = await getCountFromServer(collection(db, "orders"));
      const totalOrders = ordersCountSnap.data().count;

      // ---------------- SALES & MONTHLY ----------------
      const allOrdersSnap = await getDocs(collection(db, "orders"));

      let totalSales = 0;
      let monthlySales = {};

      allOrdersSnap.forEach((docSnap) => {
        const order = docSnap.data();

        // Only completed orders count as sales
        if (order.status !== "completed") return;

        const amount = Number(order.total || 0);
        const createdAt = parseDate(order.createdAt);

        totalSales += amount;

        if (createdAt) {
          const month = createdAt.toLocaleString("en", { month: "short" });
          monthlySales[month] = (monthlySales[month] || 0) + amount;
        }
      });

      // ---------------- RECENT ORDERS ----------------
      const recentOrdersSnap = await getDocs(
        query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(5))
      );

      const recentOrders = recentOrdersSnap.docs.map((d) => {
        const data = d.data();
        const createdAt = parseDate(data.createdAt);

        return {
          id: d.id,
          ...data,
          createdAt: createdAt?.toLocaleString() || "",
        };
      });

      // ---------------- RECENT USERS ----------------
      const recentUsersSnap = await getDocs(
        query(collection(db, "users"), orderBy("createdAt", "desc"), limit(5))
      );

      const recentUsers = recentUsersSnap.docs.map((d) => {
        const data = d.data();
        const createdAt = parseDate(data.createdAt);

        return {
          id: d.id,
          ...data,
          createdAtRelative: createdAt?.toLocaleDateString() || "",
        };
      });

      // ---------------- LOW STOCK PRODUCTS (<10 QTY) ----------------
      const productsSnap = await getDocs(collection(db, "products_dynamic"));
      let lowStock = [];

      productsSnap.forEach((docSnap) => {
        const product = { id: docSnap.id, ...docSnap.data() };

        const lowVariants =
          product.variants?.filter((v) => v.quantity < 10) || [];

        if (lowVariants.length > 0) {
          lowStock.push({
            ...product,
            lowVariants,
          });
        }
      });

      // ---------------- CONVERSION RATE ----------------
      const conversionRate =
        totalUsers > 0 ? Number(((totalOrders / totalUsers) * 100).toFixed(1)) : 0;

      setDashboard({
        totalSales,
        totalOrders,
        totalUsers,
        conversionRate,
        monthlySales,
        recentOrders,
        recentUsers,
        lowStock,
      });
    } catch (err) {
      console.error("Dashboard load failed:", err);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (!dashboard) return <p>{t("loading")}</p>;

  const labels = Object.keys(dashboard.monthlySales);
  const values = Object.values(dashboard.monthlySales);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">{t("title")}</h1>
      <p className="text-gray-500">{t("subtitle")}</p>

      {/* ---------------------------------------------------------
         TOP STATS
      ---------------------------------------------------------- */}
      <div className="grid md:grid-cols-4 gap-6">
        <StatCard
          icon={<HiCash className="w-8 h-8 text-primary" />}
          label={t("totalSales")}
          value={`$${dashboard.totalSales}`}
        />

        <StatCard
          icon={<HiShoppingBag className="w-8 h-8 text-accent" />}
          label={t("totalOrders")}
          value={dashboard.totalOrders}
        />

        <StatCard
          icon={<HiUserGroup className="w-8 h-8 text-primary" />}
          label={t("totalUsers")}
          value={dashboard.totalUsers}
        />

        <ConversionCard rate={dashboard.conversionRate} label={t("conversion")} />
      </div>

      {/* ---------------------------------------------------------
         LOW STOCK PRODUCTS
      ---------------------------------------------------------- */}
      <DashboardCard title={t("lowStockTitle")}>
        {dashboard.lowStock.length === 0 ? (
          <p className="text-gray-500">{t("noLowStock")}</p>
        ) : (
          <div className="space-y-3">
            {dashboard.lowStock.map((p) => (
              <div
                key={p.id}
                className="border-b last:border-none pb-3 flex justify-between items-start"
              >
                <div>
                  <p className="font-semibold">{p.name}</p>

                  {p.lowVariants.map((v, i) => (
                    <div key={i} className="text-gray-600 text-sm">
                      <span className="font-medium">{t("variant")}:</span>{" "}
                      {v.color} / {v.size}
                      <span className="ml-2 text-red-600 font-semibold">
                        {t("qty")}: {v.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                <HiExclamationTriangle className="text-red-600 w-6 h-6" />
              </div>
            ))}
          </div>
        )}
      </DashboardCard>

      {/* ---------------------------------------------------------
         CHARTS
      ---------------------------------------------------------- */}
      <div className="grid md:grid-cols-2 gap-6">
        <DashboardCard title={t("monthlySales")}>
          <Line
            data={{
              labels,
              datasets: [
                {
                  label: t("sales"),
                  data: values,
                  borderColor: "#0A84FF",
                  backgroundColor: "rgba(10,132,255,0.1)",
                },
              ],
            }}
          />
        </DashboardCard>

        <DashboardCard title={t("ordersPerMonth")}>
          <Bar
            data={{
              labels,
              datasets: [
                {
                  label: t("orders"),
                  data: values.map((v) => Math.round(v / 20)),
                  backgroundColor: "#C8A951",
                },
              ],
            }}
          />
        </DashboardCard>
      </div>

      {/* ---------------------------------------------------------
         RECENT ORDERS
      ---------------------------------------------------------- */}
      <DashboardCard title={t("recentOrders")}>
        {dashboard.recentOrders.length === 0 ? (
          <p className="text-gray-500">{t("noRecentOrders")}</p>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="py-3 px-4">{t("orderID")}</th>
                <th className="py-3 px-4">{t("customer")}</th>
                <th className="py-3 px-4">{t("total")}</th>
                <th className="py-3 px-4">{t("status")}</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.recentOrders.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="py-3 px-4">#{o.id}</td>
                  <td className="py-3 px-4">{o.address?.fullName || t("unknown")}</td>
                  <td className="py-3 px-4">${o.total}</td>
                  <td className="py-3 px-4">{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DashboardCard>

      {/* ---------------------------------------------------------
         RECENT USERS
      ---------------------------------------------------------- */}
      <DashboardCard title={t("recentUsers")}>
        {dashboard.recentUsers.length === 0 ? (
          <p className="text-gray-500">{t("noRecentUsers")}</p>
        ) : (
          dashboard.recentUsers.map((u) => (
            <div key={u.id} className="flex justify-between py-2 border-b last:border-none">
              <span>{u.fullName || t("unnamedUser")}</span>
              <span className="text-gray-500">{u.createdAtRelative}</span>
            </div>
          ))
        )}
      </DashboardCard>
    </div>
  );
}

/* ----------------------------------------------------------
   UI COMPONENTS
---------------------------------------------------------- */
function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 shadow p-5 bg-white flex items-center gap-4">
      <div className="p-4 bg-primary/10 rounded-xl">{icon}</div>
      <div>
        <p className="text-gray-500">{label}</p>
        <h2 className="text-2xl font-semibold">{value}</h2>
      </div>
    </div>
  );
}

function ConversionCard({ rate, label }) {
  return (
    <div className="rounded-xl border border-gray-200 shadow p-5 bg-white">
      <div className="flex items-center gap-4 w-full">
        <div className="p-4 bg-accent/10 rounded-xl">
          <HiChartPie className="w-8 h-8 text-accent" />
        </div>
        <div className="w-full">
          <p className="text-gray-500">{label}</p>
          <div className="w-full h-3 bg-gray-200 rounded-full mt-2">
            <div
              className="h-3 bg-primary rounded-full"
              style={{ width: rate + "%" }}
            />
          </div>
          <p className="text-sm mt-1 font-semibold">{rate}%</p>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ title, children }) {
  return (
    <div className="rounded-xl border border-gray-200 shadow p-5 bg-white">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}
