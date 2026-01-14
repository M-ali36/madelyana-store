"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAppContext } from "@/components/context/AppContext";

export default function SmoothScrollWrapper({ children, locale }) {
  const { navState, setScrollPosition, setScrollDirection } = useAppContext();
  const pathname = usePathname();

  const prevScrollRef = useRef(0);
  const savedScrollPosition = useRef(0);
  const smootherRef = useRef(null);

  useEffect(() => {
    // Kill old smoother before creating a new one
    const old = ScrollSmoother.get();
    if (old) old.kill();

    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    // Delay creation for hydration
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {

        const smoother = ScrollSmoother.create({
          wrapper: "#smooth-wrapper",
          content: "#smooth-content",
          smooth: 1.2,
          smoothTouch: 0.2,
          normalizeScroll: true,
          effects: true
        });

        smootherRef.current = smoother;

        // NO MORE smoother.scrollTo(0) — prevents jumping

        setTimeout(() => {
          ScrollTrigger.refresh(true);
        }, 50);

        // Track scroll position + direction
        const updateScroll = () => {
          const current = smoother.scrollTop();
          const prev = prevScrollRef.current;

          setScrollPosition(current);

          if (current > prev + 1) {
            setScrollDirection("down");
          } else if (current < prev - 1) {
            setScrollDirection("up");
          }

          prevScrollRef.current = current;
        };

        gsap.ticker.add(updateScroll);

        return () => {
          gsap.ticker.remove(updateScroll);
          if (smootherRef.current) smootherRef.current.kill();
        };
      });
    });

  }, [pathname, locale]);


  // ------------------------------------------
  // 🔒 SCROLL LOCK / UNLOCK WHEN navState OPENS
  // ------------------------------------------
  useEffect(() => {
    const smoother = smootherRef.current;
    if (!smoother) return;

    if (navState !== "") {
      // Save current position
      savedScrollPosition.current = smoother.scrollTop();

      // Freeze smoother (stops all movement)
      smoother.paused(true);

      // Stop browser native scroll
      document.body.style.overflow = "hidden";
    } else {
      // Unlock
      smoother.paused(false);

      // Restore exact scroll
      smoother.scrollTo(savedScrollPosition.current, false);

      document.body.style.overflow = "";
    }
  }, [navState]);


  return (
    <>
      <div id="smooth-wrapper">
        <div id="smooth-content">{children}</div>
      </div>

      <div id="ui-layer"></div>
    </>
  );
}
