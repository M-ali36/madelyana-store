import "../../../globals.css";
import AdminLayoutPage from "@/components/_Admin/Layout";
import { AppProvider } from "@/components/context/AppContext";
import { NextIntlClientProvider } from "next-intl";

export const metadata = {
  title: "Admin Panel",
};

export default async function AdminLayout({ children, params }) {
  const locale = (await params).locale;

  // Load translations for Admin panel
  const messages = (await import(`@root/messages/${locale}.json`)).default;

  const isArabic = locale === "ar";

  return (
    <html
      suppressHydrationWarning
      lang={locale}
      dir={isArabic ? "rtl" : "ltr"}
      
    >
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AppProvider>
            <AdminLayoutPage locale={locale}>
              {children}
            </AdminLayoutPage>
          </AppProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
