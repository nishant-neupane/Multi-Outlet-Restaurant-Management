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

  return (
    <div className={`w-72 h-screen flex flex-col shadow-lg ${
      mode === 'dark'
        ? 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white'
        : 'bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 border-r border-slate-200'
    }`}>
      {/* Header */}
      <div className={`p-6 border-b ${mode === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <ChefHat className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className={`text-xl font-bold ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>RestaurantOS</h1>
            <p className={`text-xs ${mode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Management System</p>
          </div>
        </div>

        {/* User Info Card */}
        <div className={`backdrop-blur-sm rounded-xl p-4 border ${
          mode === 'dark'
            ? 'bg-white/5 border-white/10'
            : 'bg-slate-100/50 border-slate-300'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <User2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {user?.name || "User"}
              </p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                mode === 'dark'
                  ? 'bg-blue-600/30 text-blue-200 border border-blue-500/50'
                  : 'bg-blue-100 text-blue-800 border border-blue-300'
              }`}>
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
                group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 animate-slideIn
                ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
                    : mode === 'dark'
                    ? "hover:bg-white/5 text-white hover:text-blue-200"
                    : "hover:bg-slate-200 text-slate-700 hover:text-slate-900"
                }
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
      <div className={`p-4 border-t space-y-3 ${mode === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
        {/* Quick Stats */}
        <div className={`rounded-xl p-3 border ${
          mode === 'dark'
            ? 'bg-white/5 border-white/10'
            : 'bg-slate-100/50 border-slate-300'
        }`}>
          <div className="flex items-center justify-between text-xs">
            <span className={mode === 'dark' ? 'text-gray-200' : 'text-gray-600'}>Status</span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className={`font-medium ${mode === 'dark' ? 'text-blue-200' : 'text-blue-700'}`}>Active</span>
            </div>
          </div>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleMode}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 font-semibold group border ${
            mode === 'dark'
              ? 'bg-blue-600/10 hover:bg-blue-600/20 border-blue-500/30 text-blue-200 hover:text-blue-100'
              : 'bg-blue-100/50 hover:bg-blue-200/50 border-blue-300 text-blue-700 hover:text-blue-800'
          }`}
          aria-label="Toggle dark/light mode"
        >
          {mode === "dark" ? (
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
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 font-semibold group border ${
            mode === 'dark'
              ? 'bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-400 hover:text-red-300'
              : 'bg-red-100/50 hover:bg-red-200/50 border-red-300 text-red-700 hover:text-red-800'
          }`}
        >
          <LogOut className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}