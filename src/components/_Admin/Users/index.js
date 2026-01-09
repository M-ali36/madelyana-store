// /components/_Admin/Users/index.tsx
"use client";

import React from "react";
import { useTranslations } from "next-intl";

// Hooks
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
  const t = useTranslations("admin.users");

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
    openAddUser,
    openEditUser,
    openUserDetails,
    openDeleteUser,
    openBulkDelete,
    openBulkBan,
    openBulkPasswordReset,
    closeModal,
  } = useModals();

  /** -------------------------------
   * UI
   * ------------------------------- */
  return (
    <section className="space-y-6">
      {/* HEADER */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {t("title")}
          </h1>
          <p className="text-sm text-gray-500">
            {t("subtitle")}
          </p>
        </div>

        <button
          onClick={openAddUser}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {t("actions.add")}
        </button>
      </header>

      {/* TOOLBAR */}
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          searchValue={input}
          setSearchValue={setInput}
          clearSearch={clearSearch}
          placeholder={t("search")}
        />

        <ExportButton users={users} />
      </div>

      {/* BULK ACTIONS */}
      {selected.length > 0 && (
        <BulkActions
          selected={selected}
          users={users}
          openBulkDelete={openBulkDelete}
          openBulkBan={openBulkBan}
          openBulkPasswordReset={openBulkPasswordReset}
          clearSelection={clearSelection}
        />
      )}

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ">
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
          banUser={(uid, status) =>
            openBulkBan({ users: [{ id: uid }], ban: status })
          }
        />
      </div>

      {/* PAGINATION */}
      <Pagination
        page={page}
        hasMore={hasMore}
        nextPage={() => nextPage(loadMoreUsers)}
        prevPage={prevPage}
      />

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
    </section>
  );
}
