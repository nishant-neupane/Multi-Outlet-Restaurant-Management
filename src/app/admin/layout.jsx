"use client";

import React from "react";
import { ProtectedRoute } from "../../components/protected-route";
import { Sidebar } from "../../components/sidebar";
import Header from "../../components/header";
import { useAuth } from "@/lib/auth-context";

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
  const { user } = useAuth();

  return (
    <ProtectedRoute requiredRole={["admin"]}>
      <div className="flex flex-col h-screen w-full">
        {/* Header */}
        <Header userName={user?.name || "Admin"} userRole="admin" />

        {/* Main Content */}
        <div className="flex flex-1 overflow-auto">
          {/* Sidebar */}
          <div className="hidden md:block md:w-72">
            <Sidebar items={adminMenuItems} />
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
