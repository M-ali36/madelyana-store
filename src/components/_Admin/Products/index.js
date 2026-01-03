"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import Link from "@/components/Ui/Link";
import { useLocale } from "next-intl";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState("");
  const locale = useLocale();

  // Fetch products
  const fetchProducts = async () => {
    try {
      const snap = await getDocs(collection(db, "products_dynamic"));
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(list);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Delete product
  const handleDelete = async (id, name) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete “${name}”?`
    );

    if (!confirmDelete) return;

    try {
      setDeleting(id);
      await deleteDoc(doc(db, "products_dynamic", id));
      await fetchProducts();
    } catch (err) {
      console.error("Error deleting:", err);
      alert("Delete failed.");
    } finally {
      setDeleting("");
    }
  };

  // Search filtering
  const filteredProducts = products.filter((p) => {
    const base = `${p.name} ${p.contentfulSlug}`.toLowerCase();
    const variantText = p.variants
      ?.map((v) => `${v.color} ${v.size}`.toLowerCase())
      .join(" ");

    const text = `${base} ${variantText}`.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Products</h1>

        <Link
          href="/admin/products/new"
          locale={locale}
          className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-gray-800 transition"
        >
          + Add Product
        </Link>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search by name, slug, color, size..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 shadow-card rounded-xl p-6">
        {loading ? (
          <p className="text-gray-500">Loading products...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-gray-500">No products found.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Slug</th>
                <th className="px-4 py-3 text-left font-medium">Price</th>
                <th className="px-4 py-3 text-left font-medium">Variants</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-t align-top">

                  {/* Name */}
                  <td className="px-4 py-3 font-medium">{product.name}</td>

                  {/* Slug */}
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {product.contentfulSlug}
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3">${product.price || 0}</td>

                  {/* Variants */}
                  <td className="px-4 py-3 text-sm">
                    {product.variants?.length > 0 ? (
                      <div className="space-y-1">
                        {product.variants.map((v, i) => (
                          <div
                            key={i}
                            className="flex gap-4 items-center text-gray-700"
                          >
                            <span className="px-2 py-1 bg-gray-100 rounded border">
                              {v.color}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 rounded border">
                              {v.size}
                            </span>
                            <span className="font-semibold">
                              Qty: {v.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">No variants</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <Link
                        href={`/admin/products/edit/${product.id}`}
                        locale={locale}
                        className="text-primary hover:underline"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() =>
                          handleDelete(product.id, product.name)
                        }
                        className={`text-red-600 hover:underline ${
                          deleting === product.id ? "opacity-50" : ""
                        }`}
                        disabled={deleting === product.id}
                      >
                        {deleting === product.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
