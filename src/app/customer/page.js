// app/customer/page.jsx
"use client";

import Link from "next/link";

export default function CustomerDashboard() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Your Account
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <DashboardCard
          title="Your Orders"
          desc="View all your purchases, statuses, and details."
          href="/customer/orders"
        />

        <DashboardCard
          title="Wishlist"
          desc="Your saved items."
          href="/customer/wishlist"
        />

        <DashboardCard
          title="Settings"
          desc="Update your profile and login details."
          href="/customer/settings"
        />

        <DashboardCard
          title="Address"
          desc="Manage your shipping address."
          href="/customer/address"
        />
      </div>
    </div>
  );
}

function DashboardCard({ title, desc, href }) {
  return (
    <Link
      href={href}
      className="block bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition"
    >
      <h2 className="text-lg font-semibold text-gray-800 mb-2">{title}</h2>
      <p className="text-sm text-gray-600">{desc}</p>
    </Link>
  );
}
