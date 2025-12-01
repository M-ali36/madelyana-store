// /components/_Admin/Users/Tools/getUsersPaginated.js

import { db } from "@/lib/firebaseClient";
import { collection, query, orderBy, limit, startAfter, getDocs } from "firebase/firestore";

/**
 * Paginated users fetcher
 * @param {number} pageSize - Number of users per page
 * @param {DocumentSnapshot} lastDoc - Cursor for pagination
 */
export default async function getUsersPaginated(pageSize = 10, lastDoc = null) {
  try {
    const usersRef = collection(db, "users");

    let q = query(usersRef, orderBy("createdAt", "desc"), limit(pageSize));

    if (lastDoc) {
      q = query(
        usersRef,
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(pageSize)
      );
    }

    const snapshot = await getDocs(q);

    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      users,
      lastDoc: snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1] : null,
      hasMore: snapshot.docs.length === pageSize,
    };
  } catch (error) {
    console.error("Error loading paginated users:", error);
    return { users: [], lastDoc: null, hasMore: false };
  }
}
