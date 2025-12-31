"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebaseClient";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { fetchProducts } from "@/lib/contentfulClient";
import { useRouter } from "next/navigation";

export default function AddProductPage() {
  const router = useRouter();

  const [contentfulProducts, setContentfulProducts] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]); // filtered list
  const [existingDynamicSlugs, setExistingDynamicSlugs] = useState([]);

  const [contentfulSlug, setContentfulSlug] = useState("");
  const [productInfo, setProductInfo] = useState(null);

  const [variants, setVariants] = useState([]);
  const [price, setPrice] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 🔥 Fetch Contentful products + dynamic products to filter
  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Fetch all Contentful products
        const list = await fetchProducts();

        // 2. Fetch existing Firebase dynamic product slugs
        const snap = await getDocs(collection(db, "products_dynamic"));
        const dynamic = snap.docs.map((d) => d.data().contentfulSlug);

        setContentfulProducts(list);
        setExistingDynamicSlugs(dynamic);

        // 3. Filter out Contentful products already assigned in Firebase
        const filtered = list.filter(
          (p) => !dynamic.includes(p.slug)
        );

        setAvailableProducts(filtered);
      } catch (err) {
        console.error(err);
        setError("Failed to load products.");
      }
    };

    loadData();
  }, []);

  // When Contentful product is selected → set product info
  useEffect(() => {
    if (!contentfulSlug) return;

    const selected = contentfulProducts.find(
      (p) => p.slug === contentfulSlug
    );

    setProductInfo(selected || null);
  }, [contentfulSlug, contentfulProducts]);

  // Add Variant
  const addVariant = () => {
    setVariants([...variants, { color: "", size: "", quantity: 0 }]);
  };

  // Update Variant
  const updateVariant = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  // Remove Variant
  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Save product
  const handleSubmit = async () => {
    if (!contentfulSlug || !price || variants.length === 0) {
      setError("Please fill all required fields and add at least one variant.");
      return;
    }

    if (!productInfo) {
      setError("Invalid product selection.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await addDoc(collection(db, "products_dynamic"), {
        contentfulSlug,
        name: productInfo.title,        // 🔥 Add product name
        price: Number(price),
        variants,
        createdAt: serverTimestamp(),
      });

      setSuccess("Product created successfully!");
      setTimeout(() => router.push("/admin/products"), 1200);
    } catch (err) {
      console.error(err);
      setError("Failed to save product.");
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Add Product</h1>
        <p className="text-gray-600">
          Select a Contentful product & add variants.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-card p-6 space-y-6">

        {/* Error */}
        {error && (
          <div className="rounded-md bg-red-100 text-red-700 px-4 py-3 text-sm border border-red-300">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="rounded-md bg-green-100 text-green-700 px-4 py-3 text-sm border border-green-300">
            {success}
          </div>
        )}

        {/* Contentful Product Select */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Select Contentful Product *
          </label>

          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white 
                       focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            onChange={(e) => setContentfulSlug(e.target.value)}
          >
            <option value="">Select product…</option>

            {/* Show ONLY unassigned Contentful products */}
            {availableProducts.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.title} — ({item.slug})
              </option>
            ))}
          </select>

          {availableProducts.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              All Contentful products are already assigned.
            </p>
          )}
        </div>

        {/* Contentful Info */}
        {productInfo && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-1">
            <p className="font-medium text-gray-800">Contentful Product Loaded</p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Title:</span> {productInfo.title}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Colors:</span>{" "}
              {productInfo.colors?.join(", ") || "None"}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Sizes:</span>{" "}
              {productInfo.sizes?.join(", ") || "None"}
            </p>
          </div>
        )}

        {/* Price */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Base Price *
          </label>
          <input
            type="number"
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-md 
                       focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        {/* Variants Builder */}
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

          {variants.length === 0 && (
            <p className="text-gray-500 text-sm">No variants added yet.</p>
          )}

          {variants.map((variant, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50"
            >
              {/* Color */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Color
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={variant.color}
                  onChange={(e) =>
                    updateVariant(index, "color", e.target.value)
                  }
                >
                  <option value="">Select color…</option>
                  {productInfo?.colors?.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Size */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Size
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={variant.size}
                  onChange={(e) =>
                    updateVariant(index, "size", e.target.value)
                  }
                >
                  <option value="">Select size…</option>
                  {productInfo?.sizes?.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border rounded-md"
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
                  className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 w-full"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-2 rounded-md text-white font-medium transition 
            ${loading ? "bg-gray-400" : "bg-black hover:bg-gray-800"}`}
        >
          {loading ? "Saving..." : "Create Product"}
        </button>
      </div>
    </div>
  );
}
