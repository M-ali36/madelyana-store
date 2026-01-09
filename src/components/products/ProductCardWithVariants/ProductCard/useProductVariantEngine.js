"use client";

import { useMemo, useState, useEffect } from "react";

export function useProductVariantEngine(product) {
  const rawVariants = product.variants || [];

  // --------------------------------------------------------------
  // CLEAN VARIANTS (keep out-of-stock)
  // --------------------------------------------------------------
  const variants = useMemo(() => {
    return (rawVariants || []).map((v) => {
      const obj = {};
      for (const key in v) {
        obj[key] =
          typeof v[key] === "string" ? v[key].trim() || null : v[key];
      }
      obj.quantity = Number(obj.quantity || 0);
      return obj;
    });
  }, [rawVariants]);

  const hasVariants = variants.length > 0;

  // --------------------------------------------------------------
  // ATTRIBUTE KEYS
  // --------------------------------------------------------------
  const attributeKeys = useMemo(() => {
    if (!hasVariants) return [];

    const keys = Object.keys(variants[0]).filter((key) => key !== "quantity");

    return keys.filter((key) => {
      const values = [
        ...new Set(
          variants
            .map((v) => v[key])
            .filter((v) => v !== null && v !== undefined)
        ),
      ];
      return values.length >= 1;
    });
  }, [variants]);

  // --------------------------------------------------------------
  // ATTRIBUTE OPTIONS
  // --------------------------------------------------------------
  const attributeOptions = useMemo(() => {
    const groups = {};

    attributeKeys.forEach((key) => {
      groups[key] = [
        ...new Set(
          variants
            .map((v) => v[key])
            .filter((val) => val !== null)
        ),
      ];
    });

    return groups;
  }, [variants, attributeKeys]);

  // --------------------------------------------------------------
  // SELECTION STATE
  // --------------------------------------------------------------
  const [selected, setSelected] = useState({});

  // --------------------------------------------------------------
  // SMART AUTO-SELECTION:
  // 1. Try to select the FIRST in-stock variant
  // 2. Else select the FIRST variant (all attributes)
  // --------------------------------------------------------------
  useEffect(() => {
    if (!hasVariants) return;

    // A. Try to get first in-stock
    let targetVariant =
      variants.find((v) => v.quantity > 0) || variants[0];

    if (!targetVariant) return; // Should never happen

    const newSelected = {};
    attributeKeys.forEach((key) => {
      newSelected[key] = targetVariant[key];
    });

    // Only update if changed
    if (JSON.stringify(newSelected) !== JSON.stringify(selected)) {
      setSelected(newSelected);
    }
  }, [JSON.stringify(variants), attributeKeys.join(",")]);

  // --------------------------------------------------------------
  // SELECTED VARIANT
  // --------------------------------------------------------------
  const selectedVariant = useMemo(() => {
    if (!hasVariants) return null;

    return variants.find((v) =>
      attributeKeys.every((key) => selected[key] === v[key])
    );
  }, [selected, variants, attributeKeys]);

  const variantStock = selectedVariant?.quantity ?? null;

  const allAttributesSelected = attributeKeys.every((key) => !!selected[key]);

  const canAddToCart = hasVariants
    ? allAttributesSelected && variantStock > 0
    : true;

  return {
    hasVariants,
    variants,
    attributeKeys,
    attributeOptions,
    selected,
    setSelected,
    selectedVariant,
    variantStock,
    allAttributesSelected,
    canAddToCart,
  };
}
