// /components/_Admin/Users/Hooks/useSearch.js

"use client";

import { useState, useEffect } from "react";

/**
 * Debounced search handler for admin users page.
 *
 * @param {Function} onSearch - callback (runSearch from useUsers)
 */
export default function useSearch(onSearch) {
  const [input, setInput] = useState("");
  const [debounced, setDebounced] = useState("");

  /**
   * Create a debounce (300ms delay)
   * Only triggers search after user stops typing.
   */
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebounced(input);
    }, 300);

    return () => clearTimeout(timeout);
  }, [input]);

  /**
   * Run search callback when debounced value updates
   */
  useEffect(() => {
    onSearch(debounced);
  }, [debounced]);

  /**
   * Clear search input + results
   */
  const clearSearch = () => {
    setInput("");
    onSearch("");
  };

  return {
    input,
    setInput,
    clearSearch,
  };
}
