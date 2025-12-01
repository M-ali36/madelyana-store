import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseClient"; // Firestore init
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

export async function GET() {
  try {
    // Orders
    const ordersSnap = await getDocs(collection(db, "orders"));
    const orders = ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const totalOrders = orders.length;
    const totalSales = orders.reduce((acc, o) => acc + (o.total || 0), 0);

    // Monthly sales
    const monthlySales = {};
    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      const month = date.toLocaleString("en-US", { month: "short" });
      monthlySales[month] = (monthlySales[month] || 0) + order.total;
    });

    // Users
    const usersSnap = await getDocs(collection(db, "users"));
    const users = usersSnap.docs.map((d) => d.data());
    const totalUsers = users.length;

    const conversionRate =
      totalUsers > 0 ? Math.round((totalOrders / totalUsers) * 100) : 0;

    // Recent Orders
    const recentOrdersSnap = await getDocs(
      query(
        collection(db, "orders"),
        orderBy("createdAt", "desc"),
        limit(10)
      )
    );
    const recentOrders = recentOrdersSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    // Recent Users
    const recentUsersSnap = await getDocs(
      query(
        collection(db, "users"),
        orderBy("createdAt", "desc"),
        limit(10)
      )
    );
    const recentUsers = recentUsersSnap.docs.map((d) => d.data());

    return NextResponse.json({
      totalSales,
      totalOrders,
      totalUsers,
      conversionRate,
      monthlySales,
      recentOrders,
      recentUsers,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
