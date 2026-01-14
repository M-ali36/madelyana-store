"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebaseClient";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  serverTimestamp
} from "firebase/firestore";
import { fetchProducts } from "@/lib/contentfulClient";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

// ⭐ SHARED COST ENGINE
import { calculatePricing } from "@/lib/costingEngine";

export default function AddProductPage() {
  const t = useTranslations("admin.addProduct");
  const router = useRouter();

  // Contentful
  const [contentfulProducts, setContentfulProducts] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [contentfulSlug, setContentfulSlug] = useState("");
  const [productInfo, setProductInfo] = useState(null);

  // Variants
  const [variants, setVariants] = useState([]);

  // Pricing fields
  const [basePrice, setBasePrice] = useState("");
  const [price, setPrice] = useState("");

  // Ads settings
  const [useAds, setUseAds] = useState(true);
  const [adsOverride, setAdsOverride] = useState("");
  const [unitsOverride, setUnitsOverride] = useState("");

  // Costing config (global)
  const [costConfig, setCostConfig] = useState(null);

  // Cost results
  const [totalCost, setTotalCost] = useState(null);
  const [recommendedPrice, setRecommendedPrice] = useState(null);
  const [adsCostPerUnit, setAdsCostPerUnit] = useState(null);

  // UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ---------------------------------------------------------
  // LOAD CONTENTFUL + dynamic slugs
  // ---------------------------------------------------------
  useEffect(() => {
    async function load() {
      try {
        const contentfulList = await fetchProducts();

        const snap = await getDocs(collection(db, "products_dynamic"));
        const assignedSlugs = snap.docs.map((d) => d.data().contentfulSlug);

        setContentfulProducts(contentfulList);
        setAvailableProducts(
          contentfulList.filter((p) => !assignedSlugs.includes(p.slug))
        );
      } catch (err) {
        console.error(err);
        setError(t("errors.load"));
      }
    }

    load();
  }, []);

  // ---------------------------------------------------------
  // LOAD GLOBAL STATIC DATA
  // ---------------------------------------------------------
  useEffect(() => {
    async function loadStaticConfig() {
      const ref = doc(db, "system", "staticData");
      const snap = await getDoc(ref);
      if (snap.exists()) setCostConfig(snap.data());
    }
    loadStaticConfig();
  }, []);

  // ---------------------------------------------------------
  // SELECT PRODUCT INFO FROM CONTENTFUL
  // ---------------------------------------------------------
  useEffect(() => {
    if (!contentfulSlug) return;

    const matched = contentfulProducts.find(
      (p) => p.slug === contentfulSlug
    );

    setProductInfo(matched || null);
  }, [contentfulSlug, contentfulProducts]);

  // ---------------------------------------------------------
  // VARIANT HANDLING
  // ---------------------------------------------------------
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

  // ---------------------------------------------------------
  // COST CALCULATION USING SHARED ENGINE
  // ---------------------------------------------------------
  useEffect(() => {
    if (!costConfig) return;
    if (!basePrice || isNaN(Number(basePrice))) return;

    const result = calculatePricing({
      basePrice,
      useAds,
      adsOverride,
      unitsOverride,
      costConfig,
    });

    setTotalCost(result.totalCost);
    setRecommendedPrice(result.recommendedPrice);
    setAdsCostPerUnit(result.adsCostPerUnit);

  }, [basePrice, useAds, adsOverride, unitsOverride, costConfig]);

  // ---------------------------------------------------------
  // SAVE PRODUCT
  // ---------------------------------------------------------
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

        basePrice: Number(basePrice),
        price: Number(price),

        // Ads fields
        useAds,
        adsOverride: adsOverride ? Number(adsOverride) : null,
        unitsOverride: unitsOverride ? Number(unitsOverride) : null,

        // Auto cost results
        costCalculation: {
          totalCost,
          recommendedPrice,
          adsCostPerUnit,
        },

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

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
      </div>

      <div className="space-y-6 rounded-xl border bg-white p-6 shadow">

        {/* ERRORS */}
        {error && (
          <div className="bg-red-100 border border-red-300 p-3 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-300 p-3 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* CONTENTFUL SELECT */}
        <div>
          <label className="text-sm font-medium">{t("fields.product")}</label>

          <select
            className="w-full border rounded-md p-2 mt-1"
            onChange={(e) => setContentfulSlug(e.target.value)}
          >
            <option value="">{t("select")}</option>

            {availableProducts.map((p) => (
              <option value={p.slug} key={p.slug}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        {/* PRODUCT INFO PREVIEW */}
        {productInfo && (
          <div className="bg-gray-50 border rounded p-4 text-sm">
            <p><strong>Title:</strong> {productInfo.title}</p>
            <p><strong>Colors:</strong> {productInfo.colors?.join(", ")}</p>
            <p><strong>Sizes:</strong> {productInfo.sizes?.join(", ")}</p>
          </div>
        )}

        {/* BASE PRICE */}
        <div>
          <label className="text-sm font-medium">Base Price *</label>
          <input
            type="number"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            className="w-full border rounded p-2 mt-1"
          />
        </div>

        {/* ADS SECTION */}
        <div className="space-y-2">

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={useAds}
              onChange={(e) => setUseAds(e.target.checked)}
            />
            <span>Include Ads Cost?</span>
          </label>

          {useAds && (
            <div className="grid grid-cols-2 gap-4 mt-2">

              <div>
                <label className="text-sm font-medium">Ads Override</label>
                <input
                  type="number"
                  value={adsOverride}
                  onChange={(e) => setAdsOverride(e.target.value)}
                  className="w-full border rounded p-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Units Override</label>
                <input
                  type="number"
                  value={unitsOverride}
                  onChange={(e) => setUnitsOverride(e.target.value)}
                  className="w-full border rounded p-2"
                />
              </div>

            </div>
          )}

        </div>

        {/* PRICE + COST OUTPUT */}
        <div>
          <label className="text-sm font-medium">{t("price")}</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border rounded p-2 mt-1"
          />

          {/* COST SUMMARY */}
          {totalCost !== null && (
            <div className="bg-gray-50 border rounded p-3 mt-2 text-sm space-y-1">

              <p>
                <strong>Ads Cost Per Unit:</strong>{" "}
                <span className="text-blue-700">
                  ${adsCostPerUnit}
                </span>
              </p>

              <p>
                <strong>Total Cost After Ads:</strong>{" "}
                <span className="text-red-600 font-medium">
                  ${totalCost}
                </span>
              </p>

              <p>
                <strong>Recommended Selling Price:</strong>{" "}
                <span className="text-green-700 font-bold">
                  ${recommendedPrice}
                </span>
              </p>

            </div>
          )}
        </div>

        {/* VARIANTS */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{t("variants")}</h3>
            <button
              onClick={addVariant}
              className="px-3 py-2 bg-black text-white rounded"
            >
              Add Variant
            </button>
          </div>

          {variants.map((v, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 border bg-gray-50 p-4 rounded"
            >
              <input
                placeholder="Color"
                value={v.color}
                onChange={(e) => updateVariant(index, "color", e.target.value)}
                className="border rounded p-2"
              />

              <input
                placeholder="Size"
                value={v.size}
                onChange={(e) => updateVariant(index, "size", e.target.value)}
                className="border rounded p-2"
              />

              <input
                type="number"
                placeholder="Quantity"
                value={v.quantity}
                onChange={(e) => updateVariant(index, "quantity", e.target.value)}
                className="border rounded p-2"
              />

              <button
                onClick={() => removeVariant(index)}
                className="bg-red-500 text-white rounded p-2"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* SUBMIT */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-3 text-white rounded ${
            loading ? "bg-gray-400" : "bg-black hover:bg-gray-800"
          }`}
        >
          {loading ? t("saving") : t("create")}
        </button>

      </div>
    </div>
  );
}
