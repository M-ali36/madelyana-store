"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

const ACTIVE_WINDOW = 60 * 1000; // 60 seconds

export default function useLiveSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    // ---------------------------------------------------------
    // Start of TODAY in LOCAL TIME
    // ---------------------------------------------------------
    const now = new Date();
    const startOfTodayLocal = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const startTS = Timestamp.fromDate(startOfTodayLocal);

    // ---------------------------------------------------------
    // Query sessions created today (no online filter)
    // ---------------------------------------------------------
    const q = query(
      collection(db, "sessions"),
      where("createdAt", ">=", startTS)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const nowMs = Date.now();

        const list = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((session) => {
            // Ignore sessions missing lastSeen
            if (!session.lastSeen) return false;

            const lastSeenMs = session.lastSeen.toMillis();
            // Must be within ACTIVE_WINDOW
            return nowMs - lastSeenMs < ACTIVE_WINDOW;
          })
          .sort((a, b) => b.lastSeen.toMillis() - a.lastSeen.toMillis()); // newest first

        setSessions(list);
        setLoading(false);
      },
      (err) => {
        console.error("useLiveSessions Firestore error:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { sessions, loading };
}
