"use client";

import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { useTranslations } from "next-intl";
import { getSocialIcon } from "../../Layout/Footer/getSocialIcon";

export default function ContactInfo({ data }) {
  const t = useTranslations("contact.info");

  return (
    <div className="bg-white rounded-2xl p-8 border border-neutral-200 shadow-sm">

      {/* Title */}
      <h2 className="text-2xl font-semibold mb-4">{data.contactInfoTitle}</h2>

      {/* Rich Text Description */}
      <div className="text-neutral-700 mb-6">
        {documentToReactComponents(data.contactInfoText)}
      </div>

      {/* Contact Details */}
      <div className="space-y-2 text-neutral-700">

        {/* Email */}
        <p>
          <strong>{t("email")}:</strong>{" "}
          <a href={`mailto:${data.email}`} className="underline text-primary">
            {data.email}
          </a>
        </p>

        {/* Phone */}
        <p>
          <strong>{t("phone")}:</strong>{" "}
          <a href={`tel:${data.phone}`} className="underline text-primary">
            {data.phone}
          </a>
        </p>

        {/* WhatsApp */}
        {data.whatsapp && (
          <p>
            <strong>{t("whatsapp")}:</strong>{" "}
            <a
              href={data.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              {t("chatNow")}
            </a>
          </p>
        )}
      </div>

      {/* Social Links */}
      {data.socialLinks?.length > 0 && (
        <div className="flex gap-4 mt-6">
          {data.socialLinks.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="
                w-10 h-10 rounded-full bg-gray-100 
                flex items-center justify-center 
                hover:bg-gray-200 transition
              "
            >
              {getSocialIcon(link.icon)}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
