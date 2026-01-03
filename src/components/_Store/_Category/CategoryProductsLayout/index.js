"use client";

import { useEffect, useMemo, useState } from "react";
import SidebarFilters from "./SidebarFilters";
import ProductsTopBar from "./ProductsTopBar";
import ProductGrid from "./ProductGrid";
import LoadMoreController from "./LoadMoreController";

import { db } from "@/lib/firebaseClient";
import { collection, query, where, getDocs } from "firebase/firestore";

const INITIAL_LIMIT = 8;
const LOAD_MORE_STEP = 8;

export default function CategoryProductsLayout({ products }) {
  // -----------------------------------
  // Load Firebase dynamic pricing for ALL products
  // -----------------------------------
  const [mergedProducts, setMergedProducts] = useState(products);
  const [loadingFirebase, setLoadingFirebase] = useState(true);

  useEffect(() => {
    async function loadAllDynamicPrices() {
      const updated = [];

      for (const p of products) {
        const q = query(
          collection(db, "products_dynamic"),
          where("contentfulSlug", "==", p.slug)
        );

        const snap = await getDocs(q);

        if (!snap.empty) {
          const doc = snap.docs[0];
          const data = doc.data();

          updated.push({
            ...p,
            firebaseId: doc.id,
            price: Number(data.price) || p.price || 0,
            variants: data.variants || p.variants || [],
          });
        } else {
          updated.push({
            ...p,
            firebaseId: p.id,
            price: Number(p.price) || 0,
            variants: p.variants || [],
          });
        }
      }

      setMergedProducts(updated);
      setLoadingFirebase(false);
    }

    loadAllDynamicPrices();
  }, [products]);

  // -----------------------------------
  // Compute dynamic min/max price from Firebase-merged products
  // -----------------------------------
  const prices = useMemo(() => {
    return mergedProducts
      .map((p) => Number(p.price))
      .filter((n) => !isNaN(n));
  }, [mergedProducts]);

  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;

  // -----------------------------------
  // Filters state (initialized with correct price range)
  // -----------------------------------
  const [filters, setFilters] = useState({
    inStock: false,
    colors: [],
    sizes: [],
    materials: [],
    features: [],
    price: [minPrice, maxPrice],
  });

  // Reset price range when products load OR category changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      price: [minPrice, maxPrice],
    }));
  }, [minPrice, maxPrice]);

  // -----------------------------------
  // UI state
  // -----------------------------------
  const [view, setView] = useState(3);
  const [sort, setSort] = useState("default");
  const [sortDir, setSortDir] = useState("asc");

  // -----------------------------------
  // Load more state
  // -----------------------------------
  const [limit, setLimit] = useState(INITIAL_LIMIT);
  const [autoLoaded, setAutoLoaded] = useState(false);

  // -----------------------------------
  // Filtering (now uses Firebase prices)
  // -----------------------------------
  const filteredProducts = useMemo(() => {
    return mergedProducts.filter((p) => {
      if (filters.colors.length && !filters.colors.some((c) => p.colors?.includes(c)))
        return false;

      if (filters.sizes.length && !filters.sizes.some((s) => p.sizes?.includes(s)))
        return false;

      if (filters.materials.length && !filters.materials.some((m) => p.materials?.includes(m)))
        return false;

      if (filters.features.length && !filters.features.some((f) => p.features?.includes(f)))
        return false;

      // ⭐ PRICE FILTER (correct)
      const price = Number(p.price) || 0;
      if (price < filters.price[0] || price > filters.price[1])
        return false;

      return true;
    });
  }, [mergedProducts, filters]);

  // -----------------------------------
  // Sorting
  // -----------------------------------
  const sortedProducts = useMemo(() => {
    let result = [...filteredProducts];

    if (sort === "name")
      result.sort((a, b) => a.title.localeCompare(b.title));

    if (sort === "price")
      result.sort((a, b) => (a.price || 0) - (b.price || 0));

    if (sort === "newest")
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (sortDir === "desc")
      result.reverse();

    return result;
  }, [filteredProducts, sort, sortDir]);

  // -----------------------------------
  // Auto-load more once
  // -----------------------------------
  useEffect(() => {
    if (!autoLoaded && sortedProducts.length > INITIAL_LIMIT) {
      setLimit(INITIAL_LIMIT + LOAD_MORE_STEP);
      setAutoLoaded(true);
    }
  }, [sortedProducts, autoLoaded]);

  // Visible products
  const visibleProducts = sortedProducts.slice(0, limit);

  return (
    <div className="grid lg:grid-cols-4 gap-8">
      {/* LEFT: Filters */}
      <SidebarFilters
        products={mergedProducts}
        filters={filters}
        setFilters={setFilters}
      />

      {/* RIGHT: Products */}
      <div className="lg:col-span-3">
        <ProductsTopBar
          view={view}
          setView={setView}
          sort={sort}
          setSort={setSort}
          sortDir={sortDir}
          setSortDir={setSortDir}
        />

        <ProductGrid
          products={visibleProducts}
          view={view}
          onlyInStock={filters.inStock}
        />

        <LoadMoreController
          canLoadMore={limit < sortedProducts.length}
          loadMore={() => setLimit(limit + LOAD_MORE_STEP)}
        />
      </div>
      <div className="products-list-end"></div>
    </div>
  );
}
