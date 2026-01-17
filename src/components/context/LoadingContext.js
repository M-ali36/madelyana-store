"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const LoaderContext = createContext(null);

export function LoaderProvider({ children }) {
  const pathname = usePathname();

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const isFirstLoad = useRef(true);

  useEffect(() => {
    // Prevent showing loader on first hydration
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    setLoading(true);
    setProgress(0);

    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 12;
      setProgress(Math.min(p, 90));
    }, 200);

    return () => {
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => setLoading(false), 400);
    };
  }, [pathname]);

  return (
    <LoaderContext.Provider value={{ loading, progress }}>
      {children}
    </LoaderContext.Provider>
  );
}

export function useLoader() {
  return useContext(LoaderContext);
}
