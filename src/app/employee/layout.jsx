"use client";

import { ProtectedRoute } from "../../components/protected-route";
import { Sidebar } from "../../components/sidebar";

const employeeMenuItems = [
  { label: "Dashboard", href: "/employee/dashboard" },
  { label: "New Order", href: "/employee/orders" },
  { label: "Active Orders", href: "/employee/active-orders" },
  { label: "Billing", href: "/employee/billing" },
  { label: "Menu", href: "/employee/menu" },
  { label: "My Performance", href: "/employee/performance" },
];

export default function EmployeeLayout({ children }) {
  return (
    <ProtectedRoute requiredRole={["employee"]}>
      <div className="flex h-full overflow-auto">
        <Sidebar items={employeeMenuItems} />
        <main className="flex-1 bg-color-surface h-full overflow-auto">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
