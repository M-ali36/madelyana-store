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

export default function useLiveSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    // ---------------------------------------------------------
    // Start of TODAY in LOCAL TIME (NOT UTC!)  ⭐ FIXED
    // ---------------------------------------------------------
    const now = new Date();
    const startOfTodayLocal = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() // midnight local time
    );

    const startTS = Timestamp.fromDate(startOfTodayLocal);

    // ---------------------------------------------------------
    // Live query for today's online sessions
    // ---------------------------------------------------------
    const q = query(
      collection(db, "sessions"),
      where("online", "==", true),
      where("createdAt", ">=", startTS)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

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
