"use client";

import usePresenceObserver from "@/components/hooks/usePresenceObserver";

export default function PresenceClient({ locale }) {
  usePresenceObserver(locale);
  return null;
}
