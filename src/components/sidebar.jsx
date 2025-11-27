"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import { useTheme } from "../lib/theme-context";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Users,
  UtensilsCrossed,
  FileText,
  ShoppingCart,
  Table2,
  TrendingUp,
  Receipt,
  ClipboardList,
  LogOut,
  ChefHat,
  User2,
  Moon,
  Sun,
} from "lucide-react";

const iconMap = {
  Dashboard: LayoutDashboard,
  Outlets: Store,
  Users: Users,
  "Menu Items": UtensilsCrossed,
  Menu: UtensilsCrossed,
  Reports: FileText,
  Orders: ShoppingCart,
  Tables: Table2,
  "New Order": ClipboardList,
  "Create Order": ClipboardList,
  "Active Orders": Receipt,
  Billing: Receipt,
  Performance: TrendingUp,
  "My Performance": TrendingUp,
};

export function Sidebar({ items }) {
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const getIcon = (label) => {
    const Icon = iconMap[label] || LayoutDashboard;
    return Icon;
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-500/20 text-purple-300 border border-purple-500/30";
      case "manager":
        return "bg-blue-500/20 text-blue-300 border border-blue-500/30";
      case "employee":
        return "bg-green-500/20 text-green-300 border border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border border-gray-500/30";
    }
  };

  return (
    <div className="w-72 gradient-dark text-white h-screen flex flex-col shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl gradient-orange flex items-center justify-center shadow-lg">
            <ChefHat className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">RestaurantOS</h1>
            <p className="text-xs text-gray-400">Management System</p>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-orange flex items-center justify-center">
              <User2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.name || "User"}
              </p>
              <span
                className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor(
                  user?.role
                )}`}
              >
                {user?.role || "Guest"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {items.map((item, index) => {
          const Icon = getIcon(item.label);
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${
                  isActive
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30"
                    : "hover:bg-white/5 text-gray-300 hover:text-white"
                }
                animate-slideIn
              `}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Icon
                className={`w-5 h-5 transition-transform duration-200 ${
                  isActive ? "scale-110" : "group-hover:scale-110"
                }`}
              />
              <span className="font-medium text-sm">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 space-y-3">
        {/* Quick Stats */}
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Status</span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-400 font-medium">Active</span>
            </div>
          </div>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleMode}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-all duration-200 text-amber-400 hover:text-amber-300 font-semibold group"
          aria-label="Toggle dark/light mode"
        >
          {mode === 'dark' ? (
            <>
              <Sun className="w-4 h-4 transition-transform duration-200 group-hover:rotate-45" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 transition-transform duration-200 group-hover:rotate-45" />
              <span>Dark Mode</span>
            </>
          )}
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl transition-all duration-200 text-red-400 hover:text-red-300 font-semibold group"
        >
          <LogOut className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
