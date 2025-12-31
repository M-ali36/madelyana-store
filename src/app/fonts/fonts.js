import localFont from "next/font/local";

export const elMessiri = localFont({
  src: [
    { path: "/fonts/ElMessiri-Regular.woff2", weight: "400", style: "normal" },
    { path: "/fonts/ElMessiri-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-arabic",
  display: "swap",
});

export const playfair = localFont({
  src: [
    { path: "/fonts/PlayfairDisplay-Regular.woff2", weight: "400", style: "normal" },
    { path: "/fonts/PlayfairDisplay-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-english",
  display: "swap",
});
