"use client";

export default function ActiveUsersCard({ value }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <h2 className="text-lg font-semibold text-gray-700">Real-Time Users</h2>
      <p className="text-5xl font-bold text-primary mt-3">{value}</p>
      <p className="text-sm text-gray-500">Users active in last 60 seconds</p>
    </div>
  );
}
