"use client";

import { usePathname, useRouter } from "next/navigation";

export default function LanguageSwitcher({ locale }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleChange = (newLocale) => {

    // Remove "/ar" prefix when switching to English
    let newPath = pathname.replace(/^\/ar/, "");

    // Add "/ar" prefix when switching to Arabic
    if (newLocale === "ar") {
      newPath = "/ar" + newPath;
    }

    router.push(newPath || "/");
  };

  return (
    <>
    <button aria-label="" className="header-control icons-hover primary-anime" onClick={() =>
      handleChange(locale === "ar" ? "en" : "ar")
    }>
      <span className="h-5 w-5 ltr:leading-[14px]">
        {locale === "ar" ? "En" : "ع"}
      </span>
    </button>
    </>
  );
}
