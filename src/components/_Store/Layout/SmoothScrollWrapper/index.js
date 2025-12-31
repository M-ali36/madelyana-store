"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAppContext } from "@/components/context/AppContext";

export default function SmoothScrollWrapper({ children }) {
  const { setScrollPosition, setScrollDirection } = useAppContext();
  const pathname = usePathname();

  // Store previous scroll inside a ref (avoids unwanted re-renders)
  const prevScrollRef = useRef(0);

  useEffect(() => {
    // Kill old smoother instance (required after locale/page transitions)
    const old = ScrollSmoother.get();
    if (old) old.kill();

    setTimeout(() => {
      gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

      // Create new smoother
      const smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.2,
        smoothTouch: 0.2,
        effects: true,
      });

      // Scroll to top on route change
      smoother.scrollTo(0, true);

      ScrollTrigger.refresh();

      // Update scroll position + direction every frame
      const updateScroll = () => {
        const current = smoother.scrollTop();
        const prev = prevScrollRef.current;

        // 1️⃣ Update scroll position (for parallax, UI, etc.)
        setScrollPosition(current);

        // 2️⃣ Determine direction (ONLY update when changed)
        if (current > prev + 1) {
          setScrollDirection("down");
        } else if (current < prev - 1) {
          setScrollDirection("up");
        }

        prevScrollRef.current = current;
      };

      gsap.ticker.add(updateScroll);

      // Cleanup on unmount or route change
      return () => {
        gsap.ticker.remove(updateScroll);
      };
    }, 10);
  }, [pathname]);

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">
        {children}
      </div>
    </div>
  );
}
