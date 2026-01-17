"use client";

import { useState } from "react";
import { LineChart } from "@/components/_Admin/analytics/ChartWrapper";

export default function SessionsTimeline({ data, onRangeChange }) {
  const [range, setRange] = useState("12min");

  const handleChange = (e) => {
    const r = e.target.value;
    setRange(r);
    onRangeChange(r);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          User Activity ({range === "12min" ? "Last 12 min" : range})
        </h3>

        <select
          className="border border-gray-300 rounded-md px-3 py-1 text-sm bg-white"
          value={range}
          onChange={handleChange}
        >
          <option value="12min">Last 12 min</option>
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </select>
      </div>

      {/* ⭐ Reduced Height Wrapper */}
      <div className="h-48"> {/* adjust: h-40, h-52, etc. */}
        <LineChart
          data={{
            labels: data.map((d) => d.label),
            datasets: [
              {
                label: "Active Users",
                data: data.map((d) => d.value),
                borderColor: "#4f46e5",
                backgroundColor: "rgba(79, 70, 229, 0.3)",
                fill: true,
              },
            ],
          }}
          options={{
            maintainAspectRatio: false, // ⭐ required when fixed height
            responsive: true,
            plugins: { legend: { display: false } },
          }}
        />
      </div>
    </div>
  );
}
