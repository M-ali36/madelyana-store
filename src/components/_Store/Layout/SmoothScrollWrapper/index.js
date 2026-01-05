"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAppContext } from "@/components/context/AppContext";

export default function SmoothScrollWrapper({ children, locale }) {
  const { setScrollPosition, setScrollDirection } = useAppContext();
  const pathname = usePathname();

  // Store previous scroll inside a ref (avoids unnecessary re-renders)
  const prevScrollRef = useRef(0);

  useEffect(() => {
    // Always kill old smoother before creating a new one
    const old = ScrollSmoother.get();
    if (old) old.kill();

    let smoother = null;

    // ⚠️ IMPORTANT:
    // We must delay initialization until Next.js hydration + layout are complete.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

        smoother = ScrollSmoother.create({
          wrapper: "#smooth-wrapper",
          content: "#smooth-content",
          smooth: 1.2,
          smoothTouch: 0.2,
          normalizeScroll: true, // helps Sticky/ScrollTrigger consistency
          effects: true,
        });

        // Ensure we start at correct top position (no animation)
        smoother.scrollTo(0, false);

        // ⚠️ Delay refresh to avoid "cut from top" bug
        setTimeout(() => {
          ScrollTrigger.refresh(true);
          smoother?.scrollTo(0, false); // force-correct scroll offset after refresh
        }, 50);

        // ---- Scroll Position & Direction Tracking ----
        const updateScroll = () => {
          if (!smoother) return;

          const current = smoother.scrollTop();
          const prev = prevScrollRef.current;

          // Global scroll position (used by parallax or UI)
          setScrollPosition(current);

          // Scroll direction (with threshold to avoid noise)
          if (current > prev + 1) {
            setScrollDirection("down");
          } else if (current < prev - 1) {
            setScrollDirection("up");
          }

          prevScrollRef.current = current;
        };

        gsap.ticker.add(updateScroll);

        // Clean up on unmount or route change
        return () => {
          gsap.ticker.remove(updateScroll);
          if (smoother) smoother.kill();
        };
      });
    });

  }, [pathname, locale]);

  return (
    <>
      <div id="smooth-wrapper">
        <div id="smooth-content">
          {children}
        </div>
      </div>

      {/* Optional UI layer */}
      <div id="ui-layer"></div>
    </>
  );
}
