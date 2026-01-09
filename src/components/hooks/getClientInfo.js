export default function getClientInfo() {
  if (typeof window === "undefined") return {};

  const ua = navigator.userAgent;

  const getBrowser = () => {
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari")) return "Safari";
    return "Unknown";
  };

  const getOS = () => {
    if (ua.includes("Mac")) return "MacOS";
    if (ua.includes("Windows")) return "Windows";
    if (ua.includes("Linux")) return "Linux";
    return "Unknown";
  };

  return {
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: `${window.screen.width}x${window.screen.height}`,
    browser: getBrowser(),
    os: getOS(),
    device: window.innerWidth < 768 ? "mobile" : "desktop",
    referrer: document.referrer || null,
  };
}
