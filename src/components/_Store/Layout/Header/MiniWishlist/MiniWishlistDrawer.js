"use client";

import { HiX } from "react-icons/hi";
import { useAppContext } from "@/components/context/AppContext";
import Image from "next/image";
import Link from "@/components/Ui/Link";
import { useLocale, useTranslations } from "next-intl";
import { IoBagAddOutline } from "react-icons/io5";

export default function MiniWishlistDrawer() {
  const { wishlist, setWishlist, pushNotification, navState, setNavState } =
    useAppContext();

  const locale = useLocale();
  const t = useTranslations("MiniWishlist");
  const dir = locale === "ar" ? "rtl" : "ltr";


  const isOpen = navState === "wishlist";

  // Remove an item
  const removeItem = (itemId) => {
    setWishlist((prev) => prev.filter((item) => item.id !== itemId));
  };

  return (
    <>
      {/* OVERLAY */}
      <div
        onClick={() => setNavState("")}
        className={`fixed inset-0 backdrop-blur-sm bg-black/30 opacity-0 z-40 
          transition-opacity duration-300
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
      ></div>

      {/* DRAWER */}
      <div
        className={`
          fixed top-0 h-full bg-white shadow-2xl z-50 py-4
          transition-transform duration-300 start-0
          w-[420px]
          ${
            isOpen
              ? "translate-x-0"
              : dir === "rtl"
              ? "translate-x-full"
              : "-translate-x-full"
          }
        `}
      >
        <div className="flex flex-col h-full">
          {/* HEADER */}
          <div className="flex justify-between items-center mb-4 px-4">
            <h2 className="text-base font-semibold">{t("yourWishlist")}</h2>

            <button
              onClick={() => setNavState("")}
              className="text-xl text-white h-6 w-6 rounded-full bg-neutral-900 cursor-pointer flex items-center justify-center"
            >
              <HiX className="h-3 w-3" />
            </button>
          </div>

          {/* ITEMS */}
          <div className="space-y-4 overflow-y-auto flex-1 p-6 border-y border-slate-300">
            {wishlist.length === 0 && (
              <p className="text-gray-500 text-center">{t("empty")}</p>
            )}

            {wishlist.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between pb-5 border-b border-slate-300 last:border-0"
              >
                <Image
                  src={item.image}
                  width={64}
                  height={64}
                  alt={item.title}
                  className="rounded-md me-4"
                />

                <div className="flex-1 ">
                  <h3 className="text-sm font-medium">{item.title}</h3>
                  <p className="text-gray-600 text-xs mt-1">${item.price}</p>
                    <button
                        className="text-red-500 text-sm"
                        onClick={() => removeItem(item.id)}
                    >
                        {t("remove")}
                    </button>
                </div>

                <Link
                    href={`/${item.slug}.html`}
                    area-label={t("addToCart")}
                    locale={locale}
                    className="w-10 h-10 bg-neutral-900 primary-anime text-white border border-text-neutral-900 hover:text-neutral-900 hover:bg-white inline-flex items-center justify-center rounded-full cursor-pointer"
                    >
                    <IoBagAddOutline className="h-4 w-4"/>
                </Link>

              </div>
            ))}
          </div>

          {/* FOOTER */}
          {wishlist.length > 0 && (
            <div className="p-4">
              <Link
                href="/customer/wishlist"
                locale={locale}
                onClick={() => setNavState("")}
                className="block w-full text-center py-3 rounded-full border border-neutral-900 bg-neutral-900 text-white font-semibold hover:bg-neutral-700 transition"
              >
                {t("viewWishlist")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
