import "../../../globals.css";
import AdminLayoutPage from "@/components/_Admin/Layout";
import { AppProvider } from "@/components/context/AppContext";
export const metadata = {
  title: "Admin Panel",
};

export default function AdminLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <AdminLayoutPage>{children}</AdminLayoutPage>
        </AppProvider>
      </body>
    </html>
  )
}
