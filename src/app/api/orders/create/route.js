import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseClient"; // ⭐ client SDK
import { collection, getDocs, deleteDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";

// ⭐ Validate ID Token using Google Identity Toolkit REST API  
async function verifyIdToken(idToken) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    }
  );

  const data = await response.json();

  if (data.error) return null;

  return {
    uid: data.users[0].localId,
    email: data.users[0].email,
  };
}

export async function POST(req) {
  try {
    // Read auth header
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authorization.split("Bearer ")[1];

    // ⭐ Verify token via REST API
    const decoded = await verifyIdToken(idToken);

    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const uid = decoded.uid;

    // ⭐ Fetch user cart using firebaseClient
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

    // Create order object
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
      shipping: {},

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Save order
    const orderRef = await addDoc(collection(db, "orders"), orderData);

    // Clear cart
    for (const item of cartSnap.docs) {
      await deleteDoc(doc(db, "carts", uid, "items", item.id));
    }

    // Success
    return NextResponse.json(
      { success: true, orderId: orderRef.id },
      { status: 200 }
    );
  } catch (err) {
    console.error("Order creation failed:", err);
    return NextResponse.json({ error: "Order error" }, { status: 500 });
  }
}
