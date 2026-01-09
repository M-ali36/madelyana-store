"use client";

import { useTranslations, useLocale } from "next-intl";
import { useAppContext } from "@/components/context/AppContext";

export default function AddToCartButton({
  loading,
  canAddToCart,
  addToCart,
}) {
  const t = useTranslations("AddToCartButton");
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  const { pushNotification } = useAppContext();

  const handleClick = async () => {
    const ok = await addToCart();
    if (ok) pushNotification(t("addedSuccess"), "success");
    else pushNotification(t("errorAdding"), "error");
  };

  // ---------------------------
  // FIXED LABEL LOGIC
  // ---------------------------
  const label = loading
    ? t("loading")        // ⭐ show this instead of outOfStock
    : !canAddToCart
    ? t("outOfStock")
    : t("add");

  const disabled =
    loading || !canAddToCart;

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      dir={dir}
      className={`
        w-full py-3 rounded-lg border border-black text-white bg-neutral-900
        transition-all duration-200 cursor-pointer
        disabled:bg-neutral-400 disabled:text-neutral-700
        hover:bg-neutral-700
      `}
    >
      {label}
    </button>
  );
}
