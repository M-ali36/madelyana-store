// /components/_Admin/Users/Hooks/useBulkActions.js

"use client";

import { useState } from "react";

/**
 * Hook to manage bulk user selections.
 *
 * Works with:
 * - checkboxes in UsersTable
 * - bulk action modals
 */
export default function useBulkActions() {
  const [selected, setSelected] = useState([]); // array of user IDs

  /**
   * Toggle a single user in or out of selection
   */
  const toggleUser = (uid) => {
    setSelected((prev) =>
      prev.includes(uid)
        ? prev.filter((id) => id !== uid)
        : [...prev, uid]
    );
  };

  /**
   * Select all users in the current page
   */
  const selectAll = (usersOnPage) => {
    const ids = usersOnPage.map((u) => u.id);
    setSelected(ids);
  };

  /**
   * Clear selection completely
   */
  const clearSelection = () => {
    setSelected([]);
  };

  /**
   * Is user selected?
   */
  const isSelected = (uid) => selected.includes(uid);

  /**
   * Are ALL users on page selected?
   */
  const allSelected = (usersOnPage) => {
    if (!usersOnPage.length) return false;
    return usersOnPage.every((u) => selected.includes(u.id));
  };

  return {
    selected,
    toggleUser,
    selectAll,
    clearSelection,
    isSelected,
    allSelected,
  };
}
