"use client";

import { useState } from "react";
import useAnalyticsData from "@/components/hooks/useAnalyticsData";
import ActiveUsersCard from "@/components/_Admin/analytics/ActiveUsersCard";
import DevicesChart from "@/components/_Admin/analytics/DevicesChart";
import PagesChart from "@/components/_Admin/analytics/PagesChart";
import SessionsTimeline from "@/components/_Admin/analytics/SessionsTimeline";
import FlowStats from "@/components/_Admin/analytics/FlowStats";

export default function AnalyticsPage() {
  const [range, setRange] = useState("12min");
  const { loading, metrics } = useAnalyticsData(range);

  if (loading || !metrics) {
    return (
      <div className="flex justify-center items-center p-10 text-gray-500">
        Loading analytics…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FlowStats metrics={metrics} />
      <ActiveUsersCard value={metrics.activeUsers} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DevicesChart data={metrics.devices} />
        <PagesChart data={metrics.pages} />
      </div>

      {/* ⭐ Pass range switch handler */}
      <SessionsTimeline
        data={metrics.timeline}
        onRangeChange={(r) => setRange(r)}
      />
    </div>
  );
}
