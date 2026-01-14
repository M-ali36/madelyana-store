"use client";
import { LineChart } from "@/components/_Admin/analytics/ChartWrapper";

export default function SessionsTimeline({ data }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <h3 className="text-lg font-semibold mb-4">User Activity (Last 12 min)</h3>

      <LineChart
        data={{
          labels: data.map(d => `${Math.abs(d.minute)}m ago`),
          datasets: [
            {
              label: "Active Users",
              data: data.map(d => d.value),
              borderColor: "#4f46e5",
              backgroundColor: "rgba(79, 70, 229, 0.3)",
              fill: true,
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: { legend: { display: false } },
        }}
      />
    </div>
  );
}
