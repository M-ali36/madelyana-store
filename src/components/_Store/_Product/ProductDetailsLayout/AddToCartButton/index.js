"use client";

import { useTranslations, useLocale } from "next-intl";
import { useAppContext } from "@/components/context/AppContext";

export default function AddToCartButton({ loading, canAddToCart, addToCart }) {
  const t = useTranslations("AddToCartButton");
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  const { pushNotification } = useAppContext();

  const handleClick = async () => {
    const ok = await addToCart();

    if (ok) {
      pushNotification(t("addedSuccess"), "success");
    } else {
      pushNotification(t("errorAdding"), "error");
    }
  };

  const label = loading
    ? t("loading")
    : !canAddToCart
    ? t("outOfStock")
    : t("add");

  return (
    <button
      onClick={handleClick}
      disabled={loading || !canAddToCart}
      dir={dir}
      className={`
        w-full py-3 rounded-lg border border-black text-white bg-neutral-900
        transition-all duration-200 cursor-pointer
        disabled:bg-gray-400 disabled:text-gray-700
        hover:bg-white hover:text-neutral-900
      `}
    >
      {label}
    </button>
  );
}
