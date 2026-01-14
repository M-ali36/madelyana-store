"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

const ACTIVE_WINDOW = 60 * 1000;

export default function useAnalyticsData() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const sessionsRef = collection(db, "sessions");

    const unsub = onSnapshot(sessionsRef, (snap) => {
      const now = Date.now();
      const sessions = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // ACTIVE USERS (lastSeen < 60s)
      const activeUsers = sessions.filter(s => {
        if (!s.lastSeen) return false;
        return now - s.lastSeen.toMillis() < ACTIVE_WINDOW;
      });

      // DEVICE BREAKDOWN
      const devices = {};
      activeUsers.forEach((s) => {
        devices[s.device] = (devices[s.device] || 0) + 1;
      });

      // PAGE POPULARITY
      const pages = {};
      activeUsers.forEach((s) => {
        pages[s.page] = (pages[s.page] || 0) + 1;
      });

      // Sessions timeline (last 12 minutes)
      const timeline = [];
      for (let i = 0; i < 12; i++) {
        const t = now - i * 60000;
        const count = activeUsers.filter(s => {
          const diff = t - s.lastSeen.toMillis();
          return diff < ACTIVE_WINDOW && diff >= 0;
        }).length;

        timeline.push({ minute: -i, value: count });
      }

      setMetrics({
        activeUsers: activeUsers.length,
        devices,
        pages,
        timeline: timeline.reverse(),
      });

      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { loading, metrics };
}
