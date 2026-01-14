// -------------------------------------------------------------
// SHARED COSTING ENGINE FOR ADD + EDIT PRODUCT PAGES
// -------------------------------------------------------------
//
// Now supports automatic units calculation:
// - When unitsOverride === "auto", units = sum(variant.quantity)
// -------------------------------------------------------------

export function calculatePricing({
  basePrice,
  useAds,
  adsOverride,
  unitsOverride,     // can be a number OR "auto"
  variants = [],     // ⭐ NEW
  costConfig,
}) {
  if (!costConfig) {
    return {
      totalCost: null,
      recommendedPrice: null,
      adsCostPerUnit: null,
      deliveredOrders: null,
    };
  }

  const {
    delivered_shipping_cost,
    return_rate,
    return_shipping_cost,
    profit_reminder_percent,
    ads_budget,
    units_purchased,
    delivery_rate_max,
  } = costConfig;

  const base = Number(basePrice || 0);

  // -------------------------------------------------------------
  // 1. Ads effective
  // -------------------------------------------------------------
  const adsEffective = Number(adsOverride || ads_budget || 0);

  // -------------------------------------------------------------
  // 2. Units effective logic (NEW AUTO MODE)
  // -------------------------------------------------------------
  let unitsEffective = 1;

  if (unitsOverride === "auto") {
    // SUM all variant quantities
    unitsEffective = variants.reduce(
      (sum, v) => sum + Number(v.quantity || 0),
      0
    );
  } else {
    unitsEffective = Number(unitsOverride || units_purchased || 1);
  }

  // Prevent divide by zero
  if (unitsEffective <= 0) unitsEffective = 1;

  const deliveryRate = Number(delivery_rate_max || 0.3);

  // -------------------------------------------------------------
  // 3. Delivered order volume
  // -------------------------------------------------------------
  const deliveredOrders = unitsEffective * deliveryRate;

  // -------------------------------------------------------------
  // 4. Ads cost per delivered order
  // -------------------------------------------------------------
  let adsCostPerUnit = 0;

  if (useAds && deliveredOrders > 0) {
    adsCostPerUnit = adsEffective / deliveredOrders;
  }

  // -------------------------------------------------------------
  // 5. Total cost per delivered order
  // -------------------------------------------------------------
  const cost =
    base +
    Number(delivered_shipping_cost || 0) +
    Number(return_rate || 0) * Number(return_shipping_cost || 0) +
    adsCostPerUnit;

  // -------------------------------------------------------------
  // 6. Recommended price after profit reminder
  // -------------------------------------------------------------
  const recommended =
    cost * (1 + Number(profit_reminder_percent || 0) / 100);

  return {
    totalCost: Number(cost.toFixed(2)),
    recommendedPrice: Number(recommended.toFixed(2)),
    adsCostPerUnit: Number(adsCostPerUnit.toFixed(2)),
    deliveredOrders: Number(deliveredOrders.toFixed(2)),
  };
}
