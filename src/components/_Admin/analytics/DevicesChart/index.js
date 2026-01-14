"use client";
import { DoughnutChart } from "@/components/_Admin/analytics/ChartWrapper";

export default function DevicesChart({ data }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <h3 className="text-lg font-semibold mb-4">Devices</h3>

      <DoughnutChart
        data={{
          labels: Object.keys(data),
          datasets: [
            {
              data: Object.values(data),
              backgroundColor: ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444"],
              borderWidth: 1,
            },
          ],
        }}
        options={{
          plugins: {
            legend: { position: "bottom" },
          },
        }}
      />
    </div>
  );
}
