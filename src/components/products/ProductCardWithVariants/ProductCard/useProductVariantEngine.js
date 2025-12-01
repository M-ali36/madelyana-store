"use client";

import { useMemo, useState, useEffect } from "react";

export function useProductVariantEngine(product) {
  const rawVariants = product.variants || [];

  // --------------------------------------------------------------
  // CLEAN VARIANTS
  // --------------------------------------------------------------
  const variants = useMemo(() => {
    return (rawVariants || [])
      .map((v) => {
        const obj = {};
        for (const key in v) {
          obj[key] =
            typeof v[key] === "string"
              ? v[key].trim() || null
              : v[key];
        }
        obj.quantity = Number(obj.quantity || 0);
        return obj;
      })
      .filter((v) => v.quantity > 0);
  }, [rawVariants]);

  const hasVariants = variants.length > 0;

  // --------------------------------------------------------------
  // ATTRIBUTE KEYS (dynamic)
  // --------------------------------------------------------------
  const attributeKeys = useMemo(() => {
    if (!hasVariants) return [];

    const keys = Object.keys(variants[0]).filter(
      (key) => key !== "quantity"
    );

    // Only keep attributes that have at least 2 value choices
    return keys.filter((key) => {
      const values = [
        ...new Set(
          variants
            .map((v) => v[key])
            .filter((v) => v !== null && v !== undefined)
        ),
      ];
      return values.length > 1;
    });
  }, [variants]);

  // --------------------------------------------------------------
  // ATTRIBUTE OPTIONS FOR EACH KEY
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

  // Auto-select attributes with only 1 option
  useEffect(() => {
    if (!hasVariants) return;

    setSelected((prev) => {
      const updated = { ...prev };
      let changed = false;

      attributeKeys.forEach((key) => {
        const values = attributeOptions[key] || [];
        if (values.length === 1 && !prev[key]) {
          updated[key] = values[0];
          changed = true;
        }
      });

      return changed ? updated : prev;
    });
  }, [JSON.stringify(attributeOptions), attributeKeys.join(",")]);

  // --------------------------------------------------------------
  // SELECTED VARIANT
  // --------------------------------------------------------------
  const selectedVariant = useMemo(() => {
    if (!hasVariants) return null;

    return variants.find((v) =>
      attributeKeys.every(
        (key) => selected[key] === v[key]
      )
    );
  }, [selected, variants, attributeKeys]);

  const variantStock = selectedVariant?.quantity ?? null;

  const allAttributesSelected = attributeKeys.every(
    (key) => !!selected[key]
  );

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
    canAddToCart,
  };
}
