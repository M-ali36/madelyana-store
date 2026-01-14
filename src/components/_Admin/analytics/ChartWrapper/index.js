"use client";

import "@/lib/chart"; // global chart.js registration
import { Doughnut, Bar, Line } from "react-chartjs-2";

export function DoughnutChart(props) {
  return <Doughnut {...props} />;
}

export function BarChart(props) {
  return <Bar {...props} />;
}

export function LineChart(props) {
  return <Line {...props} />;
}
