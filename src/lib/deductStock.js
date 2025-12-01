import { db } from "@/lib/firebaseClient";
import { doc, getDoc, updateDoc } from "firebase/firestore";

// ---------------------------------------------------
// Deduct stock for each order item (variants)
// ---------------------------------------------------
export async function deductStockForOrder(order) {
  // Prevent double deduction
  if (order.stockDeducted) {
    return { ok: true, message: "Stock already deducted." };
  }

  const items = order.items || [];

  // 1. First pass — validate stock
  for (const item of items) {
    const productRef = doc(db, "products_dynamic", item.productId);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
      return { ok: false, error: `Product not found: ${item.productId}` };
    }

    const product = productSnap.data();
    const variants = product.variants || [];

    const match = variants.find(
      (v) => v.color === item.variant.color && v.size === item.variant.size
    );

    if (!match) {
      return {
        ok: false,
        error: `Variant not found for ${item.name} (${item.variant.color}, ${item.variant.size})`,
      };
    }

    if (match.quantity < item.quantity) {
      return {
        ok: false,
        error: `Insufficient stock for ${item.name}: ${item.variant.color} / ${item.variant.size} — requested ${item.quantity}, available ${match.quantity}`
      };
    }
  }

  // 2. Second pass — deduct stock
  for (const item of items) {
    const productRef = doc(db, "products_dynamic", item.productId);
    const productSnap = await getDoc(productRef);
    const product = productSnap.data();
    const variants = product.variants || [];

    const updatedVariants = variants.map((v) => {
      if (v.color === item.variant.color && v.size === item.variant.size) {
        return {
          ...v,
          quantity: v.quantity - item.quantity,
        };
      }
      return v;
    });

    await updateDoc(productRef, {
      variants: updatedVariants,
    });
  }

  return { ok: true };
}
