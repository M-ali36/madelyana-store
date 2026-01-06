import AdminChangePasswordForm from "@/components/_Admin/Settings/AdminChangePasswordForm";

export default function AdminSettingsPage() {
  return (
    <div className="px-6 py-8">
      <h1 className="text-3xl font-semibold mb-6">Admin Settings</h1>
      <AdminChangePasswordForm />
    </div>
  );
}
