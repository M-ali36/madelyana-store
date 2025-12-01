// /components/_Admin/Users/Hooks/useModals.js

"use client";

import { useState } from "react";

/**
 * Central modal state manager for Admin Users Page.
 */
export default function useModals() {
  const [modal, setModal] = useState(null); // name of active modal
  const [modalData, setModalData] = useState(null); // data for modals

  /**
   * Open a modal by name + optional data
   *
   * @param {string} name - modal name
   * @param {any} data - data passed to modal
   */
  const openModal = (name, data = null) => {
    setModal(name);
    setModalData(data);
  };

  /**
   * Close any modal
   */
  const closeModal = () => {
    setModal(null);
    setModalData(null);
  };

  /**
   * Helpers for specific modals
   */
  return {
    modal,
    modalData,
    openModal,
    closeModal,

    // Convenience shortcuts
    openAddUser: () => openModal("add"),
    openEditUser: (user) => openModal("edit", user),
    openUserDetails: (user) => openModal("details", user),
    openDeleteUser: (user) => openModal("delete", user),
    openBulkDelete: (users) => openModal("bulkDelete", users),
    openBulkBan: (users) => openModal("bulkBan", users),
    openBulkPasswordReset: (users) => openModal("bulkReset", users),
  };
}
