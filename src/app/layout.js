import Header from "@/components/_Store/Layout/Header";
import "./globals.css";
import { AppProvider } from "@/components/context/AppContext";

export default function RootLayout({ children }) {
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
