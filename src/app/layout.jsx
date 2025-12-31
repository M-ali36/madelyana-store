import "./globals.css";

import { AppProvider } from "@/components/context/AppContext";

export default function RootLayout({ children }) {

  return (
    <>
        <AppProvider>
          {children}
        </AppProvider>
    </>
  );
}
