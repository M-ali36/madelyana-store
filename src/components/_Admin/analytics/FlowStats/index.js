"use client";

export default function FlowStats({ metrics }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="p-5 bg-white rounded-lg shadow border">
        <div className="text-gray-500 text-sm">Active Users</div>
        <div className="text-3xl font-semibold">{metrics.activeUsers}</div>
      </div>

      <div className="p-5 bg-white rounded-lg shadow border">
        <div className="text-gray-500 text-sm">Total Devices</div>
        <div className="text-3xl font-semibold">
          {Object.keys(metrics.devices).length}
        </div>
      </div>

      <div className="p-5 bg-white rounded-lg shadow border">
        <div className="text-gray-500 text-sm">Unique Pages</div>
        <div className="text-3xl font-semibold">
          {Object.keys(metrics.pages).length}
        </div>
      </div>
    </div>
  );
}
