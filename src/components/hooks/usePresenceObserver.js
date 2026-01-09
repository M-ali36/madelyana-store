"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { auth, db } from "@/lib/firebaseClient";
import {
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import useSessionId from "./useSessionId";
import getClientInfo from "./getClientInfo";

const HEARTBEAT = 30000;

export default function usePresenceObserver(locale) {
  const sessionId = useSessionId();
  const pathname = usePathname();
  const heartbeatRef = useRef(null);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    if (!sessionId) return;

    const ref = doc(db, "sessions", sessionId);
    const info = getClientInfo();

    // INITIAL SESSION
    const init = async () => {
      await setDoc(
        ref,
        {
          sessionId,
          uid: null,
          email: null,
          role: "guest",
          isGuest: true,

          entryPage: pathname,
          page: pathname,
          locale,

          ...info,

          online: true,
          createdAt: serverTimestamp(),
          lastSeen: serverTimestamp(),
          sessionDuration: 0,
        },
        { merge: true }
      );
    };

    init();

    // AUTH MERGE
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      await updateDoc(ref, {
        uid: user.uid,
        email: user.email || null,
        role: "customer",
        isGuest: false,
        lastSeen: serverTimestamp(),
      });
    });

    // HEARTBEAT
    heartbeatRef.current = setInterval(async () => {
      const duration = Math.floor((Date.now() - startedAt.current) / 1000);

      await updateDoc(ref, {
        page: pathname,
        online: true,
        lastSeen: serverTimestamp(),
        sessionDuration: duration,
      });
    }, HEARTBEAT);

    // CLEANUP
    const onUnload = async () => {
      const duration = Math.floor((Date.now() - startedAt.current) / 1000);
      await updateDoc(ref, {
        online: false,
        lastSeen: serverTimestamp(),
        sessionDuration: duration,
      });
    };

    window.addEventListener("beforeunload", onUnload);

    return () => {
      clearInterval(heartbeatRef.current);
      window.removeEventListener("beforeunload", onUnload);
      unsub();
    };
  }, [sessionId, pathname, locale]);
}
