"use client";

import { usePathname, useRouter } from "next/navigation";

export default function LanguageSwitcher({ locale }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleChange = (e) => {
    const newLocale = e.target.value;

    // Remove "/ar" prefix when switching to English
    let newPath = pathname.replace(/^\/ar/, "");

    // Add "/ar" prefix when switching to Arabic
    if (newLocale === "ar") {
      newPath = "/ar" + newPath;
    }

    router.push(newPath || "/");
  };

  return (
    <select
      value={locale}
      onChange={handleChange}
      className="rounded-md px-3 py-1 text-sm bg-neutral-900 border-white text-white border cursor-pointer"
    >
      <option value="en">English</option>
      <option value="ar">العربية</option>
    </select>
  );
}
