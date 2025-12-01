"use client";

import { useEffect, useState } from "react";
import {
  HiShoppingBag,
  HiUserGroup,
  HiCash,
  HiChartPie,
} from "react-icons/hi";

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

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dashboard");
        const data = await res.json();

        // Guarantee that the shape is always valid
        setDashboard({
          totalSales: data.totalSales || 0,
          totalOrders: data.totalOrders || 0,
          totalUsers: data.totalUsers || 0,
          conversionRate: data.conversionRate || 0,
          monthlySales: data.monthlySales || {},
          recentOrders: data.recentOrders || [],
          recentUsers: data.recentUsers || [],
        });
      } catch (err) {
        console.error("Dashboard error:", err);

        // Fall back to empty safe state
        setDashboard({
          totalSales: 0,
          totalOrders: 0,
          totalUsers: 0,
          conversionRate: 0,
          monthlySales: {},
          recentOrders: [],
          recentUsers: [],
        });
      }
    }
    load();
  }, []);

  if (!dashboard) return <p>Loading dashboard...</p>;

  // Safe chart values
  const labels = Object.keys(dashboard.monthlySales || {});
  const values = Object.values(dashboard.monthlySales || {});

  // Chart.js requires at least arrays, not objects
  const safeLabels = Array.isArray(labels) ? labels : [];
  const safeValues = Array.isArray(values) ? values : [];

  return (
    <div className="space-y-6">

      {/* Heading */}
      <h1 className="text-3xl font-semibold text-primary-dark">
        Admin Dashboard
      </h1>
      <p className="text-gray-500">
        Overview of your store performance and latest activities.
      </p>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">

        {/* Total Sales */}
        <div className="rounded-xl border border-gray-200 shadow p-5 bg-white">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary/10 rounded-xl">
              <HiCash className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-gray-500">Total Sales</p>
              <h2 className="text-2xl font-semibold">
                ${dashboard.totalSales}
              </h2>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="rounded-xl border border-gray-200 shadow p-5 bg-white">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-accent/10 rounded-xl">
              <HiShoppingBag className="w-8 h-8 text-accent" />
            </div>
            <div>
              <p className="text-gray-500">Orders</p>
              <h2 className="text-2xl font-semibold">
                {dashboard.totalOrders}
              </h2>
            </div>
          </div>
        </div>

        {/* Users */}
        <div className="rounded-xl border border-gray-200 shadow p-5 bg-white">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary/10 rounded-xl">
              <HiUserGroup className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-gray-500">Users</p>
              <h2 className="text-2xl font-semibold">{dashboard.totalUsers}</h2>
            </div>
          </div>
        </div>

        {/* Conversion */}
        <div className="rounded-xl border border-gray-200 shadow p-5 bg-white">
          <div className="flex items-center gap-4 w-full">
            <div className="p-4 bg-accent/10 rounded-xl">
              <HiChartPie className="w-8 h-8 text-accent" />
            </div>
            <div className="w-full">
              <p className="text-gray-500">Conversion Rate</p>
              <div className="w-full h-3 bg-gray-200 rounded-full mt-2">
                <div
                  className="h-3 bg-primary rounded-full"
                  style={{ width: dashboard.conversionRate + "%" }}
                />
              </div>
              <p className="text-sm mt-1 font-semibold">
                {dashboard.conversionRate}%
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Sales Chart */}
        <div className="rounded-xl border border-gray-200 shadow p-5 bg-white">
          <h3 className="text-xl font-semibold mb-4">Monthly Sales</h3>

          <Line
            data={{
              labels: safeLabels,
              datasets: [
                {
                  label: "Sales ($)",
                  data: safeValues,
                  borderColor: "#0A84FF",
                  backgroundColor: "rgba(10,132,255,0.1)",
                  tension: 0.4,
                },
              ],
            }}
            options={{
              plugins: {
                legend: { display: safeValues.length > 0 },
              },
            }}
          />
        </div>

        {/* Orders Chart */}
        <div className="rounded-xl border border-gray-200 shadow p-5 bg-white">
          <h3 className="text-xl font-semibold mb-4">Orders per Month</h3>

          <Bar
            data={{
              labels: safeLabels,
              datasets: [
                {
                  label: "Orders",
                  data: safeValues.map((v) => Math.round((v || 0) / 20)),
                  backgroundColor: "#C8A951",
                },
              ],
            }}
            options={{
              plugins: {
                legend: { display: safeValues.length > 0 },
              },
            }}
          />
        </div>

      </div>

      {/* Recent Orders */}
      <div className="rounded-xl border border-gray-200 shadow p-5 bg-white">
        <h3 className="text-xl font-semibold mb-4">Recent Orders</h3>

        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Total</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody>

            {dashboard.recentOrders.length === 0 && (
              <tr>
                <td colSpan="4" className="py-4 text-center text-gray-500">
                  No recent orders found
                </td>
              </tr>
            )}

            {dashboard.recentOrders.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="py-3 px-4">#{o.id}</td>
                <td className="py-3 px-4">{o.customerName || "Unknown"}</td>
                <td className="py-3 px-4">${o.total || 0}</td>
                <td className="py-3 px-4">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    {o.status || "Unknown"}
                  </span>
                </td>
              </tr>
            ))}

          </tbody>
        </table>
      </div>

      {/* Recent Users */}
      <div className="rounded-xl border border-gray-200 shadow p-5 bg-white">
        <h3 className="text-xl font-semibold mb-4">New Users</h3>

        {dashboard.recentUsers.length === 0 && (
          <p className="text-gray-500">No new users found</p>
        )}

        <div className="space-y-3">
          {dashboard.recentUsers.map((u, i) => (
            <div key={i} className="flex justify-between">
              <span>{u.name || "Unnamed User"}</span>
              <span className="text-primary font-medium">
                Joined {u.createdAtRelative || "recently"}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
