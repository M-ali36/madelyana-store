"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useLoader } from "@/components/context/LoadingContext";
import WaveLogo from "@/svgs/WaveLogo";

export default function FullScreenLoader() {
  const { loading, progress } = useLoader();

  const containerRef = useRef(null);

  const prevLoading = useRef(false);
  const hasExited = useRef(false);

  const [visible, setVisible] = useState(false);

  /* ---------------- DETECT NEW LOADING CYCLE ---------------- */
  useEffect(() => {
    const loadingStarted = !prevLoading.current && loading === true;

    if (loadingStarted) {
      hasExited.current = false;
      setVisible(true);
    }

    prevLoading.current = loading;
  }, [loading]);

  /* ---------------- ENTER ANIMATION (DOM IS READY) ---------------- */
  useLayoutEffect(() => {
    if (!visible || hasExited.current) return;

    gsap.set(containerRef.current, {
      scaleY: 0,
      transformOrigin: "bottom",
    });

    gsap.to(containerRef.current, {
      scaleY: 1,
      duration: 0.6,
      ease: "power3.out",
    });
  }, [visible]);

  /* ---------------- EXIT ANIMATION ---------------- */
  useEffect(() => {
    if (!visible || hasExited.current) return;

    const shouldExit =
      progress >= 90 ||
      (prevLoading.current === true && loading === false);

    if (shouldExit) {
      hasExited.current = true;

      gsap.to(containerRef.current, {
        scaleY: 0,
        transformOrigin: "top",
        duration: 0.6,
        ease: "power3.in",
        onComplete: () => {
          setVisible(false);
        },
      });
    }
  }, [progress, loading, visible]);

  /* ---------------- UNMOUNT ---------------- */
  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] overflow-hidden"
    >
      <div className="absolute inset-0 backdrop-blur-[4px] h-screen w-screen bg-neutral-900/80 flex items-center justify-center pointer-events-none text-white">
        <WaveLogo fill={progress} />
      </div>
    </div>
  );
}
