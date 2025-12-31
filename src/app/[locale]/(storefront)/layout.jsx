import Header from "@/components/_Store/Layout/Header";
import Footer from "@/components/_Store/Layout/Footer";
import SmoothScrollWrapper from "@/components/_Store/Layout/SmoothScrollWrapper";
import { NextIntlClientProvider } from "next-intl";
import { elMessiri, playfair } from "@/app/fonts/fonts";
import { fetchFooter } from "@/lib/contentfulClient";

export default async function RootLocaleLayout({ children, params }) {
  const locale = (await params).locale;
  const isArabic = locale === "ar";
  const messages = (await import(`@root/messages/${locale}.json`)).default;
  const pathname = `/${locale}`;
  const normalizedLocale = locale === "ar" ? "ar" : "en-US";
  
  const footer = await fetchFooter(normalizedLocale);

  // Choose correct locale font
  const fontVariable = isArabic ? elMessiri.variable : playfair.variable;

  return (
    <html
      lang={locale}
      dir={isArabic ? "rtl" : "ltr"}
      className={fontVariable}
      suppressHydrationWarning
    >
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>

          {/* Header above scroll wrapper */}
          <Header locale={locale} pathname={pathname} />

          {/* Smooth scroll area */}
          <SmoothScrollWrapper>
            <main className="pt-[120px]">
              {children}
            </main>

            <Footer locale={locale} footer={footer} />
          </SmoothScrollWrapper>

        </NextIntlClientProvider>
      </body>
    </html>
  );
}
