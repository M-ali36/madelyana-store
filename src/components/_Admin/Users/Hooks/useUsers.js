// /components/_Admin/Users/Hooks/useUsers.js

"use client";

import { useState, useEffect } from "react";
import getUsersPaginated from "../Tools/getUsersPaginated";
import searchUsers from "../Tools/searchUsers";

/**
 * Central users state manager
 * Handles:
 * - loading users
 * - pagination
 * - search
 */
export default function useUsers(pageSize = 10) {
  const [users, setUsers] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState(false);

  /** ---------------------------------------------------
   * LOAD FIRST PAGE
   * -------------------------------------------------- */
  const loadInitialUsers = async () => {
    setLoading(true);
    setSearchMode(false);

    const { users: fetched, lastDoc: cursor, hasMore } =
      await getUsersPaginated(pageSize, null);

    setUsers(fetched);
    setLastDoc(cursor);
    setHasMore(hasMore);
    setLoading(false);
  };

  /** ---------------------------------------------------
   * LOAD NEXT PAGE (pagination)
   * -------------------------------------------------- */
  const loadMoreUsers = async () => {
    if (!hasMore || searchMode) return;

    setLoading(true);

    const { users: fetched, lastDoc: cursor, hasMore: more } =
      await getUsersPaginated(pageSize, lastDoc);

    setUsers((prev) => [...prev, ...fetched]);
    setLastDoc(cursor);
    setHasMore(more);
    setLoading(false);
  };

  /** ---------------------------------------------------
   * SEARCH USERS
   * -------------------------------------------------- */
  const runSearch = async (query) => {
    if (!query || query.trim() === "") {
      setSearchMode(false);
      loadInitialUsers();
      return;
    }

    setLoading(true);
    setSearchMode(true);

    const results = await searchUsers(query);

    setUsers(results || []);
    setLoading(false);
  };

  // Load initial users on mount
  useEffect(() => {
    loadInitialUsers();
  }, []);

  return {
    users,
    loading,
    hasMore,
    searchMode,

    loadInitialUsers,
    loadMoreUsers,
    runSearch,
  };
}
