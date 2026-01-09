"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import Link from "@/components/Ui/Link";
import { useLocale, useTranslations } from "next-intl";

export default function ProductsPage() {
  const t = useTranslations("admin.products");
  const locale = useLocale();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState("");

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
      t("confirmDelete", { name })
    );

    if (!confirmDelete) return;

    try {
      setDeleting(id);
      await deleteDoc(doc(db, "products_dynamic", id));
      await fetchProducts();
    } catch (err) {
      console.error("Error deleting:", err);
      alert(t("deleteFailed"));
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

    return `${base} ${variantText}`.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">
          {t("title")}
        </h1>

        <Link
          href="/admin/products/new"
          locale={locale}
          className="rounded-md bg-neutral-900 px-4 py-2 text-white transition hover:bg-gray-800"
        >
          {t("add")}
        </Link>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder={t("search")}
          className="w-full rounded-md border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="rounded-xl">
        {loading ? (
          <p className="text-gray-500">{t("loading")}</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-gray-500">{t("empty")}</p>
        ) : (
          <table className="w-full border-collapse styled-table">
            <thead>
              <tr className="">
                <th className="">{t("table.name")}</th>
                <th className="">{t("table.slug")}</th>
                <th className="">{t("table.price")}</th>
                <th className="">{t("table.variants")}</th>
                <th className="">{t("table.actions")}</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-t align-top">
                  <td className="font-medium">{product.name}</td>

                  <td className="">
                    {product.contentfulSlug}
                  </td>

                  <td className="">
                    ${product.price || 0}
                  </td>

                  <td className="">
                    {product.variants?.length > 0 ? (
                      <div className="space-y-1">
                        {product.variants.map((v, i) => (
                          <div key={i} className="flex items-center gap-4 text-gray-700">
                            {v.color &&
                            <span className={`rounded border px-2 py-1 ${v.color.toLowerCase()}-badge`}>
                              {v.color}
                            </span>
                            }
                            {v.size &&
                            <span className="rounded border bg-gray-100 px-2 py-1">
                              {v.size}
                            </span>
                            }
                            <span className="font-semibold">
                              {t("qty", { count: v.quantity })}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">
                        {t("noVariants")}
                      </span>
                    )}
                  </td>

                  <td className="">
                    <div className="flex gap-3">
                      <Link
                        href={`/admin/products/edit/${product.id}`}
                        locale={locale}
                        className="btn-ui btn-small btn-primary"
                      >
                        {t("edit")}
                      </Link>

                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        disabled={deleting === product.id}
                        className={`btn-ui btn-small btn-danger ${
                          deleting === product.id ? "opacity-50" : ""
                        }`}
                      >
                        {deleting === product.id
                          ? t("deleting")
                          : t("delete")}
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
