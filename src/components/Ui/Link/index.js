"use client";

import Link from "next/link";

export default function Links({ href, locale, children, ...rest }) {
  // don't double-prefix if it's already absolute or already localized
  let finalHref = href;

  if (locale === "ar") {
    if (!href.startsWith("/ar")) {
      finalHref = "/ar" + (href.startsWith("/") ? href : `/${href}`);
    }
  }

  return (
    <Link href={finalHref} {...rest}>
      {children}
    </Link>
  );
}
