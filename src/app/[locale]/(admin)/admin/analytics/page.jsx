"use client";

import { useEffect, useState } from "react";
import useAnalyticsData from "@/components/hooks/useAnalyticsData";
import ActiveUsersCard from "@/components/_Admin/analytics/ActiveUsersCard";
import DevicesChart from "@/components/_Admin/analytics/DevicesChart";
import PagesChart from "@/components/_Admin/analytics/PagesChart";
import SessionsTimeline from "@/components/_Admin/analytics/SessionsTimeline";
import FlowStats from "@/components/_Admin/analytics/FlowStats";

export default function AnalyticsPage() {
  const { loading, metrics } = useAnalyticsData();

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <div className="animate-pulse text-gray-500">Loading analytics…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* SUMMARY CARDS */}
      <FlowStats metrics={metrics} />

      {/* ACTIVE USERS */}
      <ActiveUsersCard value={metrics.activeUsers} />

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DevicesChart data={metrics.devices} />
        <PagesChart data={metrics.pages} />
      </div>

      {/* SESSIONS TIMELINE */}
      <SessionsTimeline data={metrics.timeline} />

    </div>
  );
}
