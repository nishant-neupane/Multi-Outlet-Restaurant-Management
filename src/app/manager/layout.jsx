"use client";

import { ProtectedRoute } from "../../components/protected-route";
import { Sidebar } from "../../components/sidebar";
import Header from "../../components/header";
import { useAuth } from "@/lib/auth-context";

const managerMenuItems = [
  { label: "Dashboard", href: "/manager/dashboard" },
  { label: "Menu Items", href: "/manager/menu" },
  { label: "Orders", href: "/manager/orders" },
  { label: "Billing", href: "/manager/billing" },
  { label: "Tables", href: "/manager/tables" },
  { label: "Reports", href: "/manager/reports" },
];

export default function ManagerLayout({ children }) {
  const { user } = useAuth();

  return (
    <ProtectedRoute requiredRole={["manager"]}>
      <div className="flex flex-col h-screen w-full">
        {/* Header */}
        <Header userName={user?.name || "Manager"} userRole="manager" />

        {/* Main Content */}
        <div className="flex flex-1 overflow-auto">
          {/* Sidebar */}
          <div className="hidden md:block md:w-72">
            <Sidebar items={managerMenuItems} />
          </div>

          {/* Main Content Area */}
          <main className="flex-1 bg-color-surface overflow-auto">
            <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
