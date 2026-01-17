"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

export default function useAnalyticsData(range = "12min") {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const sessionsRef = collection(db, "sessions");

    const unsub = onSnapshot(sessionsRef, (snap) => {
      const now = Date.now();
      const sessions = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // ACTIVE USERS (last 60 sec)
      const activeUsers = sessions.filter((s) => {
        if (!s.lastSeen) return false;
        return now - s.lastSeen.toMillis() < 60_000;
      });

      // DEVICE COUNT
      const devices = {};
      activeUsers.forEach((s) => {
        devices[s.device] = (devices[s.device] || 0) + 1;
      });

      // PAGES COUNT
      const pages = {};
      activeUsers.forEach((s) => {
        pages[s.page] = (pages[s.page] || 0) + 1;
      });

      // ⭐ FIXED timeline based on selected range
      const timeline = buildTimeline(range, sessions);

      setMetrics({
        activeUsers: activeUsers.length,
        devices,
        pages,
        timeline,
      });

      setLoading(false);
    });

    return () => unsub();
  }, [range]);

  return { loading, metrics };
}

/* -------------------------------------------------------
    FIXED Timeline Builder
    Corrects hour/day/week/month/year data
------------------------------------------------------- */
function buildTimeline(range, sessions) {
  const now = Date.now();

  // Count sessions whose lastSeen is inside a time block
  function countRange(start, end) {
    return sessions.filter((s) => {
      if (!s.lastSeen) return false;
      const ts = s.lastSeen.toMillis();
      return ts >= start && ts < end;
    }).length;
  }

  /* ---------------------------
      12-minute timeline
  --------------------------- */
  if (range === "12min") {
    return Array.from({ length: 12 }).map((_, i) => ({
      label: `${12 - i}m ago`,
      value: countRange(now - (i + 1) * 60_000, now - i * 60_000),
    })).reverse();
  }

  /* ---------------------------
      Hourly for 1 day (24h)
  --------------------------- */
  if (range === "day") {
    return Array.from({ length: 24 }).map((_, i) => ({
      label: `${23 - i}h ago`,
      value: countRange(now - (i + 1) * 3_600_000, now - i * 3_600_000),
    })).reverse();
  }

  /* ---------------------------
      Daily for 1 week
  --------------------------- */
  if (range === "week") {
    return Array.from({ length: 7 }).map((_, i) => ({
      label: `${6 - i}d ago`,
      value: countRange(now - (i + 1) * 86_400_000, now - i * 86_400_000),
    })).reverse();
  }

  /* ---------------------------
      Daily for 1 month (30 days)
  --------------------------- */
  if (range === "month") {
    return Array.from({ length: 30 }).map((_, i) => ({
      label: `${29 - i}d ago`,
      value: countRange(now - (i + 1) * 86_400_000, now - i * 86_400_000),
    })).reverse();
  }

  /* ---------------------------
      Monthly for 1 year (12 months)
  --------------------------- */
  if (range === "year") {
    const monthMs = 30.44 * 24 * 60 * 60 * 1000; // avg month
    return Array.from({ length: 12 }).map((_, i) => ({
      label: `${11 - i}mo ago`,
      value: countRange(now - (i + 1) * monthMs, now - i * monthMs),
    })).reverse();
  }

  return [];
}
