import { db } from "@/lib/firebaseClient";
import { doc, getDoc, updateDoc } from "firebase/firestore";

// -----------------------------------------
// Improved variant matching
// -----------------------------------------
function variantsMatch(variant, itemVariant) {
  for (const key in itemVariant) {
    const val = itemVariant[key];

    // Skip empty fields inside Firestore
    if (variant[key] === "") continue;

    if (variant[key] !== val) return false;
  }
  return true;
}

// -----------------------------------------
export async function deductStockForOrder(order) {
  if (order.stockDeducted) {
    return { ok: true, message: "Stock already deducted." };
  }

  const items = order.items || [];

  // -----------------------------------------
  // 1️⃣ VALIDATION PASS
  // -----------------------------------------
  for (const item of items) {
    const productRef = doc(db, "products_dynamic", item.productId);
    const snap = await getDoc(productRef);

    if (!snap.exists())
      return { ok: false, error: `Product not found: ${item.productId}` };

    const product = snap.data();
    const variants = product.variants || [];

    const match = variants.find((v) => variantsMatch(v, item.variant));

    if (!match)
      return {
        ok: false,
        error: `Variant not found for ${item.title} → ${JSON.stringify(
          item.variant
        )}`,
      };

    if (Number(match.quantity) < item.qty)
      return {
        ok: false,
        error: `Insufficient stock for ${item.title} (${item.qty} requested, ${match.quantity} available)`,
      };
  }

  // -----------------------------------------
  // 2️⃣ DEDUCTION PASS
  // -----------------------------------------
  for (const item of items) {
    const productRef = doc(db, "products_dynamic", item.productId);
    const snap = await getDoc(productRef);

    if (!snap.exists()) continue;

    const product = snap.data();
    const variants = product.variants || [];

    const updated = variants.map((v) =>
      variantsMatch(v, item.variant)
        ? { ...v, quantity: Number(v.quantity) - item.qty }
        : v
    );

    await updateDoc(productRef, { variants: updated });
  }

  return { ok: true };
}
