"use client";

import React, { useEffect, useState } from "react";
import Link from "@/components/Ui/Link";
import Logo from "@/svgs/Logo";
import { usePathname } from "next/navigation";

export default function HeaderLogo({ locale }) {
  const [isHome, setIsHome] = useState(false);
    const pathname = usePathname();

  useEffect(() => {
    const path = window.location.pathname;

    const homePaths = ["/", "/ar", "/ar/" , "/en", "/en/"];

    setIsHome(homePaths.includes(path));
  }, [pathname]);

  return (
    <div className="col-span-2">
      {isHome ? (
        <h1>
          <Logo className="w-42 text-black" />
        </h1>
      ) : (
        <Link href={`/`} locale={locale} aria-label="Go to Home">
          <Logo className="w-42 text-black" />
        </Link>
      )}
    </div>
  );
}
