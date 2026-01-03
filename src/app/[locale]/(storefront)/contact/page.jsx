import Seo from "@/components/Seo";
import { fetchContactPage } from "@/lib/contentfulClient";
import ContactHero from "@/components/_Store/_Contact/ContactHero";
import ContactInfo from "@/components/_Store/_Contact/ContactInfo";
import ContactForm from "@/components/_Store/_Contact/ContactForm";
import { notFound } from "next/navigation";

export const revalidate = 60;

export default async function ContactPage(props) {
  const { locale } = await props.params;
  const normalizedLocale = locale === "ar" ? "ar" : "en-US";

  const data = await fetchContactPage(normalizedLocale);
  if (!data) return notFound();

  return (
    <>
      <Seo seo={data.seo} type="website" slug="contact" />
      <div className="w-full">
        <ContactHero
          image={data.bannerImage}
          title={data.title}
          subTitle={data.subTitle}
        />

        <div className="container mx-auto px-4 max-w-7xl py-16 grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4"><ContactInfo data={data} /></div>
            <div className="lg:col-span-8"><ContactForm /></div>
        </div>
      </div>
    </>
  );
}
