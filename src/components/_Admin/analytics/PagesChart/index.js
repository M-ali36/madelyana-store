"use client";
import { BarChart } from "@/components/_Admin/analytics/ChartWrapper";

export default function PagesChart({ data }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <h3 className="text-lg font-semibold mb-4">Most Active Pages</h3>

      <BarChart
        data={{
          labels: Object.keys(data),
          datasets: [
            {
              label: "Visitors",
              data: Object.values(data),
              backgroundColor: "#2563eb",
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: "#475569" } },
            y: { ticks: { color: "#475569" } },
          },
        }}
      />
    </div>
  );
}
