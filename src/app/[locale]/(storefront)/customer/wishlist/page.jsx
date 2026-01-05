"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebaseClient";
import {
  collection,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";

import Link from "@/components/Ui/Link";
import ProductCarouselBySlugs from "@/components/products/ProductCarouselBySlugs";
import { useLocale, useTranslations } from "next-intl";

export default function WishlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const locale = useLocale();
  const t = useTranslations("wishlistPage");

  // -----------------------------------------------------
  // Fetch wishlist from Firestore
  // -----------------------------------------------------
  useEffect(() => {
    const fetchWishlist = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const ref = collection(db, "users", user.uid, "wishlist");
      const snap = await getDocs(ref);

      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      setItems(list);
      setLoading(false);
    };

    fetchWishlist();
  }, []);

  // -----------------------------------------------------
  // Remove item from wishlist
  // -----------------------------------------------------
  const removeItem = async (productId) => {
    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "users", user.uid, "wishlist", productId);
    await deleteDoc(ref);

    setItems((prev) => prev.filter((i) => i.id !== productId));
  };

  // -----------------------------------------------------
  // Loading State
  // -----------------------------------------------------
  if (loading) {
    return <div className="text-gray-600">{t("loading")}</div>;
  }

  // -----------------------------------------------------
  // Empty State
  // -----------------------------------------------------
  if (items.length === 0) {
    return (
      <div className="text-center text-gray-600 mt-10">
        <p>{t("empty")}</p>

        <Link
          href="/"
          locale={locale}
          className="inline-block mt-4 px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-gray-800 transition"
        >
          {t("browseProducts")}
        </Link>
      </div>
    );
  }

  // Extract slugs only
  const slugs = items.map((item) => item.slug);

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        {t("title")}
      </h1>

      {/* Pass slugs only */}
      <ProductCarouselBySlugs slugs={slugs} />
    </div>
  );
}
