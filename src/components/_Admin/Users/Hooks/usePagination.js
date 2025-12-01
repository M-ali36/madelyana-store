// /components/_Admin/Users/Hooks/usePagination.js

"use client";

/**
 * Pagination logic for admin users page.
 * Works hand-in-hand with useUsers().
 */

import { useState } from "react";

export default function usePagination() {
  const [page, setPage] = useState(1);

  /**
   * Move to next page.
   * @param {Function} loadMoreUsers - callback from useUsers
   */
  const nextPage = async (loadMoreUsers) => {
    await loadMoreUsers();
    setPage((prev) => prev + 1);
  };

  /**
   * Move to previous page.
   * NOTE: We cannot move backwards in Firestore cursor-based pagination,
   * but we DO allow UI page movement for display purposes.
   */
  const prevPage = async () => {
    if (page === 1) return;
    setPage((prev) => prev - 1);
  };

  /**
   * Reset pagination back to page 1.
   * Called when search mode activates.
   */
  const resetPagination = () => {
    setPage(1);
  };

  return {
    page,
    nextPage,
    prevPage,
    resetPagination,
  };
}
