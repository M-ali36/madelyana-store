"use client";

import { useEffect, useState } from "react";
import { useAppContext } from "@/components/context/AppContext";
import { db } from "@/lib/firebaseClient";
import { collection, query, where, getDocs } from "firebase/firestore";

import AnimatedImage from "@/components/Ui/AnimatedImage";
import Link from "@/components/Ui/Link";
import useCurrency from "@/components/hooks/useCurrency";
import { useLocale } from "next-intl";
import { HiOutlineHeart } from "react-icons/hi";

/* -----------------------------------------
   Skeleton helpers
------------------------------------------ */
const SkeletonBox = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export default function ProductCardRelated({ product }) {
  const [merged, setMerged] = useState(product);
  const [loading, setLoading] = useState(true);

  const { wishlist, setWishlist } = useAppContext();
  const { format } = useCurrency();
  const locale = useLocale();

  /* -----------------------------------------
     1️⃣ Load price ONLY from Firebase
  ------------------------------------------ */
  useEffect(() => {
    async function loadFirebasePrice() {
      try {
        const q = query(
          collection(db, "products_dynamic"),
          where("contentfulSlug", "==", merged.slug)
        );

        const snap = await getDocs(q);

        if (!snap.empty) {
          const doc = snap.docs[0];
          const data = doc.data();

          setMerged((prev) => ({
            ...prev,
            firebaseId: doc.id,
            price: Number(data.price) || 0,
          }));
        } else {
          setMerged((prev) => ({
            ...prev,
            firebaseId: prev.firebaseId || prev.id,
            price: 0,
          }));
        }
      } catch (e) {
        console.error("Firebase price load error:", e);
      }

      setLoading(false);
    }

    loadFirebasePrice();
  }, [merged.slug]);

  /* -----------------------------------------
     2️⃣ Wishlist
  ------------------------------------------ */
  const isInWishlist = wishlist.some(
    (w) => w.id === merged.firebaseId
  );

  const toggleWishlist = () => {
    if (loading) return;

    if (isInWishlist) {
      setWishlist(wishlist.filter((w) => w.id !== merged.firebaseId));
    } else {
      setWishlist([
        ...wishlist,
        {
          id: merged.firebaseId,
          slug: merged.slug,
          title: merged.title,
          image: merged.images?.[0]?.url,
          price: merged.price,
        },
      ]);
    }
  };

  /* -----------------------------------------
     3️⃣ Images logic
  ------------------------------------------ */
  const mainImage =
    merged.images?.find((i) => i.tag === "imageMain")?.url ||
    merged.images?.[0]?.url ||
    "/placeholder.webp";

  const colorImages =
    merged.images?.filter(
      (i) => i.tag?.startsWith("image") && i.tag !== "imageMain"
    ) || [];

  const [activeImage, setActiveImage] = useState(mainImage);

  /* -----------------------------------------
     4️⃣ Render
  ------------------------------------------ */
  return (
    <div className="group relative">
      {/* IMAGE */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100">
        <Link href={`/${merged.slug}.html`} locale={locale}>
          {loading ? (
            <SkeletonBox className="absolute inset-0" />
          ) : (
            <AnimatedImage
              image={activeImage}
              alt={merged.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity" />
        </Link>

        {/* Wishlist (top-left) */}
        <button
          type="button"
          onClick={toggleWishlist}
          className={`absolute top-3 left-3 cursor-pointer z-10 w-10 h-10 rounded-full border flex items-center justify-center transition
            ${
              isInWishlist
                ? "bg-rose-500 border-rose-500 text-white"
                : "border-white text-white hover:bg-white hover:text-black"
            }
          `}
        >
          <HiOutlineHeart className="w-5 h-5" />
        </button>

        {/* Color thumbnails (top-right) */}
        {colorImages.length > 0 && (
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
            {colorImages.map((img) => (
              <button
                key={img.url}
                onClick={() => setActiveImage(img.url)}
                className={`w-10 h-10 cursor-pointer rounded-full overflow-hidden heavy-shade relative  transition
                  ${
                    activeImage === img.url
                      ? "active"
                      : ""
                  }
                `}
              >
                <img
                  src={img.url}
                  alt=""
                  className="w-full h-full object-cover rounded-full"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* INFO (always visible) */}
      <div className="mt-4">
        <Link
          href={`/${merged.slug}.html`}
          locale={locale}
          className="block text-lg font-medium leading-snug hover:underline"
        >
          {merged.title}
        </Link>

        <div className="mt-1 text-xl font-semibold">
          {loading ? (
            <SkeletonBox className="h-4 w-20" />
          ) : (
            format(merged.price)
          )}
        </div>
      </div>
    </div>
  );
}
