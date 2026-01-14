"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebaseClient";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { fetchProducts } from "@/lib/contentfulClient";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";

// ⭐ SHARED COST ENGINE
import { calculatePricing } from "@/lib/costingEngine";

export default function EditProductPage() {
  const t = useTranslations("admin.editProduct");
  const router = useRouter();
  const params = useParams();
  const productId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [contentfulProducts, setContentfulProducts] = useState([]);
  const [productInfo, setProductInfo] = useState(null);

  // GLOBAL STATIC CONFIG
  const [costConfig, setCostConfig] = useState(null);

  // FORM FIELDS
  const [form, setForm] = useState({
    name: "",
    contentfulSlug: "",
    basePrice: "",
    price: "",
    useAds: false,
    adsOverride: "",
    unitsOverride: "",
    variants: [],
  });

  // COST RESULTS
  const [totalCost, setTotalCost] = useState(null);
  const [recommendedPrice, setRecommendedPrice] = useState(null);
  const [adsCostPerUnit, setAdsCostPerUnit] = useState(null);

  // UI
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ---------------------------------------------------------
  // LOAD PRODUCT + CONTENTFUL + STATIC CONFIG
  // ---------------------------------------------------------
  useEffect(() => {
    async function loadData() {
      try {
        const snap = await getDoc(doc(db, "products_dynamic", productId));
        if (!snap.exists()) {
          setError(t("errors.notFound"));
          return;
        }

        const data = snap.data();

        // Load Contentful list
        const list = await fetchProducts();
        setContentfulProducts(list);

        const matched = list.find((p) => p.slug === data.contentfulSlug);
        setProductInfo(matched || null);

        // Load global static costing data
        const configSnap = await getDoc(doc(db, "system", "staticData"));
        if (configSnap.exists()) setCostConfig(configSnap.data());

        // Fill form
        setForm({
          name: matched?.title || data.name,
          contentfulSlug: data.contentfulSlug,
          basePrice: data.basePrice || "",
          price: data.price || "",
          useAds: data.useAds || true,
          adsOverride: data.adsOverride ?? "",
          unitsOverride: data.unitsOverride ?? "",
          variants: data.variants || [],
        });
      } catch (err) {
        console.error(err);
        setError(t("errors.load"));
      }
      setLoading(false);
    }

    loadData();
  }, [productId]);

  // ---------------------------------------------------------
  // FORM UPDATE HANDLER
  // ---------------------------------------------------------
  const updateField = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  // ---------------------------------------------------------
  // VARIANT HANDLERS
  // ---------------------------------------------------------
  const updateVariant = (index, field, value) => {
    const updated = [...form.variants];
    updated[index][field] = value;
    setForm({ ...form, variants: updated });
  };

  const addVariant = () =>
    setForm((f) => ({
      ...f,
      variants: [...f.variants, { color: "", size: "", quantity: 0 }],
    }));

  const removeVariant = (index) =>
    setForm((f) => ({
      ...f,
      variants: f.variants.filter((_, i) => i !== index),
    }));

  // ---------------------------------------------------------
  // COST CALCULATION USING SHARED ENGINE
  // ---------------------------------------------------------
  useEffect(() => {
    if (!costConfig) return;
    if (!form.basePrice || isNaN(Number(form.basePrice))) return;

    const result = calculatePricing({
      basePrice: form.basePrice,
      useAds: form.useAds,
      adsOverride: form.adsOverride,
      unitsOverride: form.unitsOverride,
      costConfig,
    });

    setTotalCost(result.totalCost);
    setRecommendedPrice(result.recommendedPrice);
    setAdsCostPerUnit(result.adsCostPerUnit);

  }, [
    form.basePrice,
    form.useAds,
    form.adsOverride,
    form.unitsOverride,
    costConfig,
  ]);

  // ---------------------------------------------------------
  // SAVE PRODUCT
  // ---------------------------------------------------------
  const handleSave = async () => {
    if (!form.price) {
      setError(t("errors.price"));
      return;
    }
    if (form.variants.length === 0) {
      setError(t("errors.variants"));
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await updateDoc(doc(db, "products_dynamic", productId), {
        basePrice: Number(form.basePrice),
        price: Number(form.price),

        useAds: form.useAds,
        adsOverride: form.adsOverride
          ? Number(form.adsOverride)
          : null,
        unitsOverride: form.unitsOverride
          ? Number(form.unitsOverride)
          : null,

        costCalculation: {
          totalCost,
          recommendedPrice,
          adsCostPerUnit,
        },

        variants: form.variants,
        updatedAt: new Date(),
      });

      setSuccess(t("success"));
      setTimeout(() => router.push("/admin/products"), 1200);
    } catch (err) {
      console.error(err);
      setError(t("errors.save"));
    }

    setSaving(false);
  };

  // ---------------------------------------------------------
  // RENDER UI
  // ---------------------------------------------------------
  if (loading) {
    return <p className="text-gray-500">{t("loading")}</p>;
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <h1 className="text-2xl font-semibold">{t("title")}</h1>

      <div className="space-y-6 rounded-xl border p-6 bg-white shadow">

        {/* ERRORS */}
        {error && (
          <div className="border border-red-300 bg-red-100 p-3 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="border border-green-300 bg-green-100 p-3 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* NAME */}
        <div>
          <label className="text-sm font-semibold">Name</label>
          <input
            disabled
            value={form.name}
            className="w-full border bg-gray-100 rounded p-2"
          />
        </div>

        {/* SLUG */}
        <div>
          <label className="text-sm font-semibold">Slug</label>
          <input
            disabled
            value={form.contentfulSlug}
            className="w-full border bg-gray-100 rounded p-2"
          />
        </div>

        {/* BASE PRICE */}
        <div>
          <label className="text-sm font-semibold">Base Price *</label>
          <input
            type="number"
            value={form.basePrice}
            onChange={(e) => updateField("basePrice", e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        {/* ADS SECTION */}
        <div className="space-y-2">

          {/* Toggle */}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={form.useAds}
              onChange={(e) =>
                updateField("useAds", e.target.checked)
              }
            />
            <span>Include Ads Cost?</span>
          </label>

          {/* Overrides */}
          {form.useAds && (
            <div className="grid grid-cols-2 gap-4 mt-2">

              <div>
                <label className="text-sm font-medium">Ads Override</label>
                <input
                  type="number"
                  value={form.adsOverride}
                  onChange={(e) =>
                    updateField("adsOverride", e.target.value)
                  }
                  className="w-full border rounded p-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Units Override</label>
                <input
                  type="number"
                  value={form.unitsOverride}
                  onChange={(e) =>
                    updateField("unitsOverride", e.target.value)
                  }
                  className="w-full border rounded p-2"
                />
              </div>

            </div>
          )}
        </div>

        {/* PRICE + COST SUMMARY */}
        <div>
          <label className="text-sm font-semibold">Price *</label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => updateField("price", e.target.value)}
            className="w-full border rounded p-2"
          />

          {totalCost !== null && (
            <div className="border bg-gray-50 p-3 mt-2 rounded text-sm space-y-1">

              <p>
                <strong>Ads Cost Per Unit:</strong>{" "}
                <span className="text-blue-700">${adsCostPerUnit}</span>
              </p>

              <p>
                <strong>Total Cost:</strong>{" "}
                <span className="text-red-600 font-medium">${totalCost}</span>
              </p>

              <p>
                <strong>Recommended Price:</strong>{" "}
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
              className="bg-black text-white px-3 py-2 rounded"
            >
              Add Variant
            </button>
          </div>

          {form.variants.map((v, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 border p-4 rounded"
            >
              <input
                placeholder="Color"
                value={v.color}
                onChange={(e) =>
                  updateVariant(index, "color", e.target.value)
                }
                className="border p-2 rounded"
              />

              <input
                placeholder="Size"
                value={v.size}
                onChange={(e) =>
                  updateVariant(index, "size", e.target.value)
                }
                className="border p-2 rounded"
              />

              <input
                type="number"
                placeholder="Quantity"
                value={v.quantity}
                onChange={(e) =>
                  updateVariant(index, "quantity", e.target.value)
                }
                className="border p-2 rounded"
              />

              <button
                onClick={() => removeVariant(index)}
                className="bg-red-500 text-white p-2 rounded"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* SAVE BUTTON */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-3 text-white rounded ${
            saving ? "bg-gray-400" : "bg-black hover:bg-gray-800"
          }`}
        >
          {saving ? t("saving") : t("save")}
        </button>

      </div>
    </div>
  );
}
