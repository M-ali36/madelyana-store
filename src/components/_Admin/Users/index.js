// /components/_Admin/Users/index.js

"use client";

import React from "react";

import useUsers from "./Hooks/useUsers";
import usePagination from "./Hooks/usePagination";
import useSearch from "./Hooks/useSearch";
import useBulkActions from "./Hooks/useBulkActions";
import useModals from "./Hooks/useModals";

// Components
import UsersTable from "./Components/UsersTable";
import Pagination from "./Components/Pagination";
import SearchBar from "./Components/SearchBar";
import BulkActions from "./Components/BulkActions";
import ExportButton from "./Components/ExportButton";

// Modals
import AddUserModal from "./Modals/AddUserModal";
import EditUserModal from "./Modals/EditUserModal";
import UserDetailsModal from "./Modals/UserDetailsModal";
import DeleteUserModal from "./Modals/DeleteUserModal";
import BulkDeleteModal from "./Modals/BulkDeleteModal";
import BulkBanModal from "./Modals/BulkBanModal";
import BulkPasswordResetModal from "./Modals/BulkPasswordResetModal";

export default function UsersPage() {
  /** -------------------------------
   * Hooks
   * ------------------------------- */
  const {
    users,
    loading,
    hasMore,
    loadMoreUsers,
    loadInitialUsers,
    runSearch,
  } = useUsers(10);

  const { page, nextPage, prevPage, resetPagination } = usePagination();
  const { input, setInput, clearSearch } = useSearch((q) => {
    runSearch(q);
    resetPagination();
  });

  const {
    selected,
    toggleUser,
    selectAll,
    clearSelection,
    isSelected,
    allSelected,
  } = useBulkActions();

  const {
    modal,
    modalData,
    openModal,
    closeModal,
    openAddUser,
    openEditUser,
    openUserDetails,
    openDeleteUser,
    openBulkDelete,
    openBulkBan,
    openBulkPasswordReset,
  } = useModals();

  /** -------------------------------
   * UI Rendering
   * ------------------------------- */
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Users Management</h1>

      {/* ACTION BAR */}
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1">
          <SearchBar
            searchValue={input}
            setSearchValue={setInput}
            clearSearch={clearSearch}
          />
        </div>

        {/* Add User */}
        <button
          onClick={openAddUser}
          className="ml-4 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm"
        >
          + Add User
        </button>
      </div>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <BulkActions
          selected={selected}
          users={users}
          openBulkDelete={openBulkDelete}
          openBulkBan={openBulkBan}
          openBulkPasswordReset={openBulkPasswordReset}
        />
      )}

      {/* Users Table */}
      <UsersTable
        users={users}
        loading={loading}
        isSelected={isSelected}
        toggleUser={toggleUser}
        allSelected={allSelected}
        selectAll={selectAll}
        openEditUser={openEditUser}
        openDeleteUser={openDeleteUser}
        openUserDetails={openUserDetails}
        openBulkPasswordReset={openBulkPasswordReset}
        banUser={(uid, status) => openBulkBan({ users: [{ id: uid }], ban: status })}
      />

      {/* Pagination */}
      <Pagination
        page={page}
        hasMore={hasMore}
        nextPage={() => nextPage(loadMoreUsers)}
        prevPage={prevPage}
      />

      {/* Export All */}
      <ExportButton users={users} />

      {/* MODALS */}
      <AddUserModal
        isOpen={modal === "add"}
        closeModal={closeModal}
        refreshUsers={loadInitialUsers}
      />

      <EditUserModal
        isOpen={modal === "edit"}
        closeModal={closeModal}
        user={modalData}
        refreshUsers={loadInitialUsers}
      />

      <UserDetailsModal
        isOpen={modal === "details"}
        closeModal={closeModal}
        user={modalData}
      />

      <DeleteUserModal
        isOpen={modal === "delete"}
        closeModal={closeModal}
        user={modalData}
        refreshUsers={loadInitialUsers}
      />

      <BulkDeleteModal
        isOpen={modal === "bulkDelete"}
        closeModal={closeModal}
        users={modalData}
        refreshUsers={loadInitialUsers}
      />

      <BulkBanModal
        isOpen={modal === "bulkBan"}
        closeModal={closeModal}
        users={modalData?.users}
        ban={modalData?.ban}
        refreshUsers={loadInitialUsers}
      />

      <BulkPasswordResetModal
        isOpen={modal === "bulkReset"}
        closeModal={closeModal}
        users={modalData}
      />
    </div>
  );
}
