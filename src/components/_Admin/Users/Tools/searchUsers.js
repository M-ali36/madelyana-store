// /components/_Admin/Users/Tools/searchUsers.js

import { db } from "@/lib/firebaseClient";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

/**
 * Search users by multiple fields
 * Firestore limitations require client-side filtering for partial matches.
 *
 * @param {string} searchTerm
 * @returns {Array} filtered users
 */
export default async function searchUsers(searchTerm = "") {
  try {
    const term = searchTerm.toLowerCase().trim();

    if (!term) return [];

    const usersRef = collection(db, "users");

    // Fetch a reasonable batch to search through
    const q = query(usersRef, orderBy("createdAt", "desc"), limit(200));

    const snapshot = await getDocs(q);

    const allUsers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Client-side filtering for partial matching
    const filtered = allUsers.filter((user) => {
      const email = user.email?.toLowerCase() || "";
      const name = user.name?.toLowerCase() || "";
      const uid = user.id?.toLowerCase() || "";
      const role = user.role?.toLowerCase() || "";
      const phone = user.phone?.toLowerCase() || "";

      return (
        email.includes(term) ||
        name.includes(term) ||
        uid.includes(term) ||
        role.includes(term) ||
        phone.includes(term)
      );
    });

    return filtered;
  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
}
