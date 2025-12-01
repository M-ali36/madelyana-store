import { NextResponse } from "next/server";
import { auth, db } from "@/lib/firebaseAdmin"; // admin SDK
import { collection, getDocs, deleteDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";

// 🔥 Make sure you have firebaseAdmin.js for Admin SDK authentication
// This ensures the API can read user carts securely

export async function POST(req) {
  try {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authorization.split("Bearer ")[1];
    const decoded = await auth.verifyIdToken(idToken);
    const uid = decoded.uid;

    // Fetch user cart
    const cartSnap = await getDocs(collection(db, "carts", uid, "items"));
    if (cartSnap.empty) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const items = cartSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Calculate totals
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Order payload
    const orderData = {
      userId: uid,
      userEmail: decoded.email || "",
      items: items.map((item) => ({
        productId: item.productId,
        contentfulSlug: item.contentfulSlug,
        name: item.name,
        variant: item.variant,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal,
      total: subtotal,
      status: "Pending",
      paymentStatus: "Unpaid",
      paymentMethod: "COD",

      shipping: {}, // will fill later when you build checkout form

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Save order
    const orderRef = await addDoc(collection(db, "orders"), orderData);

    // Clear cart
    for (const item of cartSnap.docs) {
      await deleteDoc(doc(db, "carts", uid, "items", item.id));
    }

    // Return success
    return NextResponse.json(
      { success: true, orderId: orderRef.id },
      { status: 200 }
    );
  } catch (err) {
    console.error("Order creation failed:", err);
    return NextResponse.json({ error: "Order error" }, { status: 500 });
  }
}
