"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/_Store/Layout/Header";
import { AppProvider } from "@/components/context/AppContext";

export function LayoutSwitcher({ children }) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return (
        <html lang="en">
        <body>
            {children}
        </body>
        </html>
    );
  }

  if (pathname.includes("/invoice")) {
    return (
        <html lang="en">
        <body>
            {children}
        </body>
        </html>
    );
  }

    return (
        <html lang="en">
        <body>
            <AppProvider>
                <Header />
                <main>{children}</main>
            </AppProvider>
        </body>
        </html>
    );
}
