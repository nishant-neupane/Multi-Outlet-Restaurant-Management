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
      <div className="flex flex-col h-screen w-full">
        {/* Main Content */}
        <div className="flex flex-1 overflow-auto">
          {/* Sidebar */}
          <div className="hidden md:block md:w-72">
            <Sidebar items={employeeMenuItems} />
          </div>

          {/* Main Content Area */}
          <main className="flex-1 bg-color-surface overflow-auto">
            <div className="p-4 md:p-6 lg:p-6 w-full w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
