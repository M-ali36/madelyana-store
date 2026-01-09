"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebaseClient";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { fetchProducts } from "@/lib/contentfulClient";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";

export default function EditProductPage() {
  const t = useTranslations("admin.editProduct");
  const router = useRouter();
  const params = useParams();
  const productId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [contentfulProducts, setContentfulProducts] = useState([]);
  const [productInfo, setProductInfo] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    contentfulSlug: "",
    price: "",
    variants: [],
  });

  // Load Firestore product + Contentful products
  useEffect(() => {
    const loadData = async () => {
      try {
        const snap = await getDoc(doc(db, "products_dynamic", productId));
        if (!snap.exists()) {
          setError(t("errors.notFound"));
          return;
        }

        const data = snap.data();

        const cList = await fetchProducts();
        setContentfulProducts(cList);

        const matched = cList.find((p) => p.slug === data.contentfulSlug);
        setProductInfo(matched || null);

        setForm({
          name: matched?.title || data.name || "",
          contentfulSlug: data.contentfulSlug || "",
          price: data.price || "",
          variants: data.variants || [],
        });
      } catch (err) {
        console.error(err);
        setError(t("errors.load"));
      }

      setLoading(false);
    };

    loadData();
  }, [productId]);

  // Update field
  const updateField = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  // Variant editing
  const updateVariant = (index, field, value) => {
    const updated = [...form.variants];
    updated[index][field] = value;
    setForm({ ...form, variants: updated });
  };

  const addVariant = () =>
    setForm({
      ...form,
      variants: [...form.variants, { color: "", size: "", quantity: 0 }],
    });

  const removeVariant = (index) =>
    setForm({
      ...form,
      variants: form.variants.filter((_, i) => i !== index),
    });

  // Save form
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
        price: Number(form.price),
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

  if (loading) {
    return <p className="text-gray-500">{t("loading")}</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
      </div>

      <div className="space-y-6 rounded-xl border bg-white p-6 shadow-card">
        {/* Error */}
        {error && (
          <div className="rounded border border-red-300 bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="rounded border border-green-300 bg-green-100 px-4 py-3 text-green-700">
            {success}
          </div>
        )}

        {/* NAME */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            {t("fields.name")}
          </label>
          <input
            disabled
            value={form.name}
            className="w-full rounded-md border bg-gray-100 px-4 py-2"
          />
        </div>

        {/* SLUG */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            {t("fields.slug")}
          </label>
          <input
            disabled
            value={form.contentfulSlug}
            className="w-full rounded-md border bg-gray-100 px-4 py-2"
          />
        </div>

        {/* PRICE */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            {t("fields.price")} *
          </label>
          <input
            type="number"
            min="0"
            value={form.price}
            onChange={(e) => updateField("price", e.target.value)}
            className="w-full rounded-md border px-4 py-2"
          />
        </div>

        {/* VARIANTS */}
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

          {form.variants.map((variant, index) => (
            <div
              key={index}
              className="grid grid-cols-1 gap-4 rounded-lg border bg-gray-50 p-4 md:grid-cols-4"
            >
              <div>
                <label className="mb-1 block text-sm text-gray-700">
                  {t("color")}
                </label>
                <input
                  value={variant.color}
                  onChange={(e) =>
                    updateVariant(index, "color", e.target.value)
                  }
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-700">
                  {t("size")}
                </label>
                <input
                  value={variant.size}
                  onChange={(e) =>
                    updateVariant(index, "size", e.target.value)
                  }
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-700">
                  {t("quantity")}
                </label>
                <input
                  type="number"
                  min="0"
                  value={variant.quantity}
                  onChange={(e) =>
                    updateVariant(index, "quantity", e.target.value)
                  }
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>

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

        {/* SAVE */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full rounded-md py-2 text-white ${
            saving ? "bg-gray-400" : "bg-neutral-900 hover:bg-gray-800"
          }`}
        >
          {saving ? t("saving") : t("save")}
        </button>
      </div>
    </div>
  );
}
