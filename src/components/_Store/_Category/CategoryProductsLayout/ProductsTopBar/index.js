"use client";
import { useEffect } from "react";
import { BsSortDownAlt, BsSortUp } from "react-icons/bs";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function ProductsTopBar({ sort, setSort, sortDir, setSortDir }) {
  const toggleDirection = () => {
    setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // ⭐ PIN CONTROLS LIKE EXTERNAL COMPONENT
  useEffect(() => {
    const filterContainer = document.querySelector(".sort-controls");
    if (filterContainer) {
      ScrollTrigger.create({
        trigger: filterContainer,
        start: "top bottom",
        end: "bottom bottom",
        endTrigger: ".products-list-end",
        pin: true,
        scrub: true,
        pinSpacing: false,
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div className="sort-controls relative">
      <div className="absolute bottom-0 end-0 inline-flex items-center justify-end mb-6 gap-3 border rounded-full p-1 border-neutral-900/50 bg-neutral-900/20">
        {/* Sorting */}
        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border-0 rounded px-3 py-2"
          >
            <option value="default">Default</option>
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="newest">Newest</option>
          </select>

          {/* Sorting Direction Toggle */}
          <button
            onClick={toggleDirection}
            className="
              rounded-full w-10 h-10 bg-neutral-900 text-white
              flex items-center justify-center transition cursor-pointer
            "
          >
            {sortDir === "asc" ? (
              <BsSortUp className="text-xl" />
            ) : (
              <BsSortDownAlt className="text-xl" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
