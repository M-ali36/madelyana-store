import Header from "@/components/_Store/Layout/Header";
import Footer from "@/components/_Store/Layout/Footer";
import SmoothScrollWrapper from "@/components/_Store/Layout/SmoothScrollWrapper";
import { NextIntlClientProvider } from "next-intl";
import { elMessiri, playfair } from "@/app/fonts/fonts";
import { fetchFooter } from "@/lib/contentfulClient";
import NotificationContainer from "@/components/Ui/NotificationContainer";
import PresenceClient from "@/components/_Store/Layout/PresenceClient";
import MobileNav from "@/components/_Store/Layout/Header/MobileNav";
import MiniCartDrawer from "@/components/_Store/Layout/Header/MiniCart/MiniCartDrawer";
import MiniWishlistDrawer from "@/components/_Store/Layout/Header/MiniWishlist/MiniWishlistDrawer";
import NavigationMobile from "@/components/_Store/Layout/Header/Navigation/NavigationMobile";

export default async function RootLocaleLayout({ children, params }) {
  const locale = (await params).locale;
  const isArabic = locale === "ar";
  const messages = (await import(`@root/messages/${locale}.json`)).default;
  const pathname = `/${locale}`;
  const normalizedLocale = locale === "ar" ? "ar" : "en-US";
  
  const footer = await fetchFooter(normalizedLocale);
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
          

          <Header locale={locale} pathname={pathname} />

          <SmoothScrollWrapper locale={locale}>
            <main className="pt-[60px]">
              {children}
            </main>

            <Footer locale={locale} footer={footer} />
          </SmoothScrollWrapper>
          <MobileNav locale={locale} pathname={pathname}/>
          <MiniCartDrawer />
          <MiniWishlistDrawer />
          <NavigationMobile />
        </NextIntlClientProvider>

        <NotificationContainer locale={locale}/>
        <script src="https://www.tiktok.com/embed.js" async></script>
      </body>
    </html>
  );
}
