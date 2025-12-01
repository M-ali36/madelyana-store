// /components/_Admin/Users/Tools/getUserStats.js

import { db } from "@/lib/firebaseClient";
import { doc, getDoc } from "firebase/firestore";

/**
 * Fetch detailed statistics for a single user.
 * Works with values stored in the main user document.
 *
 * @param {string} uid - User ID
 */
export default async function getUserStats(uid) {
  try {
    if (!uid) return { success: false, error: "Missing user ID" };

    const ref = doc(db, "users", uid);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      return { success: false, error: "User not found" };
    }

    const data = snapshot.data();

    return {
      success: true,
      stats: {
        totalOrders: data.totalOrders ?? 0,
        completedOrders: data.completedOrders ?? 0,
        totalSpent: data.totalSpent ?? 0,
        averageOrderValue:
          data.totalOrders > 0
            ? Math.round((data.totalSpent / data.totalOrders) * 100) / 100
            : 0,
        lastLogin: data.lastLogin || null,
        lastOrderDate: data.lastOrderDate || null,
      },
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return { success: false, error: error.message };
  }
}
