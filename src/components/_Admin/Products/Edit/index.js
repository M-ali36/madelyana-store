"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebaseClient";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { fetchContentfulProducts } from "@/lib/contentfulClient";
import { useRouter, useParams } from "next/navigation";

export default function EditProductPage() {
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
        // Fetch product from Firestore
        const snap = await getDoc(doc(db, "products_dynamic", productId));
        if (!snap.exists()) {
          setError("Product not found.");
          return;
        }

        const data = snap.data();

        // Fetch Contentful products list
        const cList = await fetchContentfulProducts();
        setContentfulProducts(cList);

        // Find the Contentful product info
        const matched = cList.find((p) => p.slug === data.contentfulSlug);
        setProductInfo(matched || null);

        // Populate form
        setForm({
          name: matched?.title || data.name || "",
          contentfulSlug: data.contentfulSlug || "",
          price: data.price || "",
          variants: data.variants || [],
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load product.");
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
      setError("Price is required.");
      return;
    }

    if (form.variants.length === 0) {
      setError("Add at least one variant.");
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

      setSuccess("Product updated successfully!");

      setTimeout(() => router.push("/admin/products"), 1200);
    } catch (err) {
      console.error(err);
      setError("Failed to save product.");
    }

    setSaving(false);
  };

  if (loading) {
    return <p className="text-gray-500">Loading product…</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Edit Product</h1>
      </div>

      <div className="bg-white p-6 border rounded-xl shadow-card space-y-6">
        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded border border-red-300">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="bg-green-100 text-green-700 px-4 py-3 rounded border border-green-300">
            {success}
          </div>
        )}

        {/* NAME (disabled) */}
        <div>
          <label className="block mb-1 text-sm font-semibold text-gray-700">
            Product Name (from Contentful)
          </label>
          <input
            disabled
            value={form.name}
            className="w-full px-4 py-2 border rounded-md bg-gray-100"
          />
        </div>

        {/* SLUG (disabled) */}
        <div>
          <label className="block mb-1 text-sm font-semibold text-gray-700">
            Contentful Slug (locked)
          </label>
          <input
            disabled
            value={form.contentfulSlug}
            className="w-full px-4 py-2 border rounded-md bg-gray-100"
          />
        </div>

        {/* PRICE */}
        <div>
          <label className="block mb-1 text-sm font-semibold text-gray-700">
            Base Price *
          </label>
          <input
            type="number"
            min="0"
            value={form.price}
            onChange={(e) => updateField("price", e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:ring-primary"
          />
        </div>

        {/* VARIANTS */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Variants</h3>
            <button
              onClick={addVariant}
              className="px-3 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            >
              + Add Variant
            </button>
          </div>

          {form.variants.map((variant, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 border rounded-lg"
            >
              {/* Color */}
              <div>
                <label className="block mb-1 text-sm text-gray-700">
                  Color
                </label>
                <input
                  value={variant.color}
                  onChange={(e) =>
                    updateVariant(index, "color", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              {/* Size */}
              <div>
                <label className="block mb-1 text-sm text-gray-700">
                  Size
                </label>
                <input
                  value={variant.size}
                  onChange={(e) =>
                    updateVariant(index, "size", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block mb-1 text-sm text-gray-700">
                  Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={variant.quantity}
                  onChange={(e) =>
                    updateVariant(index, "quantity", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              {/* Remove */}
              <div className="flex items-end">
                <button
                  onClick={() => removeVariant(index)}
                  className="px-3 py-2 w-full bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* SAVE BUTTON */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-2 rounded-md text-white transition ${
            saving ? "bg-gray-400" : "bg-black hover:bg-gray-800"
          }`}
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
