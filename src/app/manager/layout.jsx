"use client";

import { ProtectedRoute } from "../../components/protected-route";
import { Sidebar } from "../../components/sidebar";

const managerMenuItems = [
  { label: "Dashboard", href: "/manager/dashboard" },
  { label: "Menu Items", href: "/manager/menu" },
  { label: "Orders", href: "/manager/orders" },
  { label: "Billing", href: "/manager/billing" },
  { label: "Tables", href: "/manager/tables" },
  { label: "Reports", href: "/manager/reports" },
];

export default function ManagerLayout({ children }) {
  return (
    <ProtectedRoute requiredRole={["manager"]}>
      <div className="flex h-full overflow-auto">
        <Sidebar items={managerMenuItems} />
        <main className="flex-1 bg-color-surface h-full overflow-auto">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
