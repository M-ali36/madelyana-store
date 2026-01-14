"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { auth, db } from "@/lib/firebaseClient";
import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import useSessionId from "./useSessionId";
import getClientInfo from "./getClientInfo";

const HEARTBEAT = 30000; // 30s

export default function usePresenceObserver(locale) {
  const sessionId = useSessionId();
  const pathname = usePathname();
  const heartbeatRef = useRef(null);
  const startedAt = useRef(Date.now());

  // SAFETY: do not run anything until sessionId resolves
  if (!sessionId) {
    console.log("[Presence] Waiting for sessionId...");
  }

  const ref = sessionId ? doc(db, "sessions", sessionId) : null;

  // ---------------------------------------------------------
  // INIT + AUTH + HEARTBEAT (RUNS ONCE)
  // ---------------------------------------------------------
  useEffect(() => {
    if (!sessionId) return;
    if (!ref) return;

    const info = getClientInfo();
    console.log("[Presence] Initializing session:", sessionId);

    // Create session (MERGE avoids missing-doc issues)
    const init = async () => {
      await setDoc(ref, {
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
      }, { merge: true });

      console.log("[Presence] Created/merged session");
    };

    init();

    // AUTH MERGE
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      console.log("[Presence] User logged in → merging...");
      await setDoc(ref, {
        uid: user.uid,
        email: user.email || null,
        role: "customer",
        isGuest: false,
        lastSeen: serverTimestamp(),
      }, { merge: true });
    });

    // HEARTBEAT
    heartbeatRef.current = setInterval(async () => {
      const duration = Math.floor((Date.now() - startedAt.current) / 1000);

      try {
        await setDoc(
          ref,
          {
            online: true,
            lastSeen: serverTimestamp(),
            sessionDuration: duration,
          },
          { merge: true }
        );

        console.log("[Presence] Heartbeat ✓");
      } catch (err) {
        console.error("[Presence] Heartbeat FAILED:", err);
      }
    }, HEARTBEAT);

    // UNLOAD
    const onUnload = async () => {
      const duration = Math.floor((Date.now() - startedAt.current) / 1000);

      await setDoc(
        ref,
        {
          online: false,
          lastSeen: serverTimestamp(),
          sessionDuration: duration,
        },
        { merge: true }
      );
    };

    window.addEventListener("beforeunload", onUnload);

    return () => {
      clearInterval(heartbeatRef.current);
      window.removeEventListener("beforeunload", onUnload);
      unsubAuth();
    };
  }, [sessionId, locale]);


  // ---------------------------------------------------------
  // PAGE CHANGE (RUNS ON EVERY ROUTE CHANGE)
  // ---------------------------------------------------------
  useEffect(() => {
    if (!sessionId || !ref) return;

    console.log("[Presence] Page changed →", pathname);

    setDoc(
      ref,
      {
        page: pathname,
        lastSeen: serverTimestamp(),
      },
      { merge: true }
    ).catch((err) => console.error("[Presence] Page update FAILED:", err));

  }, [pathname, sessionId]);
}
