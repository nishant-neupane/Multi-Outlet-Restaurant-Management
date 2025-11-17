"use client";

import React from "react";
import { ProtectedRoute } from "../../components/protected-route";
import { Sidebar } from "../../components/sidebar";

const adminMenuItems = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Outlets", href: "/admin/outlets" },
  { label: "Users", href: "/admin/users" },
  { label: "Menu Items", href: "/admin/menu" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Billing", href: "/admin/billing" },
  { label: "Reports", href: "/admin/reports" },
];

export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute requiredRole={["admin"]}>
      <div className="flex h-full overflow-auto">
        <Sidebar items={adminMenuItems} />
        <main className="flex-1 bg-color-surface h-full overflow-auto">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
