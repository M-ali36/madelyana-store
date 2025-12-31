import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale }) => {
  const safeLocale = locale || "en";

  return {
    locale: safeLocale,
    messages: (await import(`@root/messages/${safeLocale}.json`)).default
  };
});