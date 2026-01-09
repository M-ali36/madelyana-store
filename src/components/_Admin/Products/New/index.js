"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebaseClient";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { fetchProducts } from "@/lib/contentfulClient";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function AddProductPage() {
  const t = useTranslations("admin.addProduct");
  const router = useRouter();

  const [contentfulProducts, setContentfulProducts] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [existingDynamicSlugs, setExistingDynamicSlugs] = useState([]);

  const [contentfulSlug, setContentfulSlug] = useState("");
  const [productInfo, setProductInfo] = useState(null);

  const [variants, setVariants] = useState([]);
  const [price, setPrice] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch Contentful + dynamic products
  useEffect(() => {
    const loadData = async () => {
      try {
        const list = await fetchProducts();

        const snap = await getDocs(collection(db, "products_dynamic"));
        const dynamic = snap.docs.map((d) => d.data().contentfulSlug);

        setContentfulProducts(list);
        setExistingDynamicSlugs(dynamic);

        setAvailableProducts(
          list.filter((p) => !dynamic.includes(p.slug))
        );
      } catch (err) {
        console.error(err);
        setError(t("errors.load"));
      }
    };

    loadData();
  }, []);

  // Select Contentful product
  useEffect(() => {
    if (!contentfulSlug) return;

    const selected = contentfulProducts.find(
      (p) => p.slug === contentfulSlug
    );

    setProductInfo(selected || null);
  }, [contentfulSlug, contentfulProducts]);

  // Variants
  const addVariant = () => {
    setVariants([...variants, { color: "", size: "", quantity: 0 }]);
  };

  const updateVariant = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Save
  const handleSubmit = async () => {
    if (!contentfulSlug || !price || variants.length === 0) {
      setError(t("errors.required"));
      return;
    }

    if (!productInfo) {
      setError(t("errors.invalid"));
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await addDoc(collection(db, "products_dynamic"), {
        contentfulSlug,
        name: productInfo.title,
        price: Number(price),
        variants,
        createdAt: serverTimestamp(),
      });

      setSuccess(t("success"));
      setTimeout(() => router.push("/admin/products"), 1200);
    } catch (err) {
      console.error(err);
      setError(t("errors.save"));
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-gray-600">{t("subtitle")}</p>
      </div>

      <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-card">
        {/* Error */}
        {error && (
          <div className="rounded-md border border-red-300 bg-red-100 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="rounded-md border border-green-300 bg-green-100 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* Contentful Select */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {t("fields.product")} *
          </label>

          <select
            className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
            onChange={(e) => setContentfulSlug(e.target.value)}
          >
            <option value="">{t("select")}</option>

            {availableProducts.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.title} — ({item.slug})
              </option>
            ))}
          </select>

          {availableProducts.length === 0 && (
            <p className="mt-2 text-sm text-gray-500">
              {t("allAssigned")}
            </p>
          )}
        </div>

        {/* Contentful Info */}
        {productInfo && (
          <div className="space-y-1 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="font-medium">{t("loaded")}</p>
            <p className="text-sm">
              <strong>{t("titleLabel")}:</strong> {productInfo.title}
            </p>
            <p className="text-sm">
              <strong>{t("colors")}:</strong>{" "}
              {productInfo.colors?.join(", ") || t("none")}
            </p>
            <p className="text-sm">
              <strong>{t("sizes")}:</strong>{" "}
              {productInfo.sizes?.join(", ") || t("none")}
            </p>
          </div>
        )}

        {/* Price */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {t("price")} *
          </label>
          <input
            type="number"
            min="0"
            className="w-full rounded-md border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        {/* Variants */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t("variants")}</h3>
            <button
              onClick={addVariant}
              className="rounded-md bg-neutral-900 px-3 py-2 text-white hover:bg-gray-800"
            >
              {t("addVariant")}
            </button>
          </div>

          {variants.length === 0 && (
            <p className="text-sm text-gray-500">{t("noVariants")}</p>
          )}

          {variants.map((variant, index) => (
            <div
              key={index}
              className="grid grid-cols-1 gap-4 rounded-lg border bg-gray-50 p-4 md:grid-cols-4"
            >
              {/* Color */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("color")}
                </label>
                <select
                  className="w-full rounded-md border px-3 py-2"
                  value={variant.color}
                  onChange={(e) =>
                    updateVariant(index, "color", e.target.value)
                  }
                >
                  <option value="">{t("selectColor")}</option>
                  {productInfo?.colors?.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Size */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("size")}
                </label>
                <select
                  className="w-full rounded-md border px-3 py-2"
                  value={variant.size}
                  onChange={(e) =>
                    updateVariant(index, "size", e.target.value)
                  }
                >
                  <option value="">{t("selectSize")}</option>
                  {productInfo?.sizes?.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("quantity")}
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full rounded-md border px-3 py-2"
                  value={variant.quantity}
                  onChange={(e) =>
                    updateVariant(index, "quantity", e.target.value)
                  }
                />
              </div>

              {/* Remove */}
              <div className="flex items-end">
                <button
                  onClick={() => removeVariant(index)}
                  className="w-full rounded-md bg-red-500 px-3 py-2 text-white hover:bg-red-600"
                >
                  {t("remove")}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full rounded-md py-2 font-medium text-white ${
            loading ? "bg-gray-400" : "bg-neutral-900 hover:bg-gray-800"
          }`}
        >
          {loading ? t("saving") : t("create")}
        </button>
      </div>
    </div>
  );
}
