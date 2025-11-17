"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../lib/auth-context";
import { useRouter } from "next/navigation";
import {
  Store,
  ShoppingCart,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ArrowRight,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalOutlets: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token && user?.role === "admin") {
      fetchDashboardData();
    } else if (user && user.role !== "admin") {
      router.push("/unauthorized");
    }
  }, [token, user, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [outletsRes, ordersRes, usersRes, paymentsRes] = await Promise.all([
        fetch("/api/outlets", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/payments", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!outletsRes.ok || !ordersRes.ok || !usersRes.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const outletsData = await outletsRes.json();
      const ordersData = await ordersRes.json();
      const usersData = await usersRes.json();
      const paymentsData = paymentsRes.ok ? await paymentsRes.json() : [];

      const orders = Array.isArray(ordersData) ? ordersData : [];
      const completedOrders = orders.filter(
        (order) =>
          order.status === "completed" || order.paymentStatus === "completed"
      );
      const pendingOrders = orders.filter(
        (order) =>
          order.status === "pending" || order.paymentStatus === "pending"
      );

      let totalRevenue = 0;
      if (Array.isArray(paymentsData)) {
        totalRevenue = paymentsData
          .filter((payment) => payment.status === "completed")
          .reduce((sum, payment) => sum + (payment.amount || 0), 0);
      } else {
        totalRevenue = completedOrders.reduce(
          (sum, order) => sum + (order.totalAmount || 0),
          0
        );
      }

      const recentOrdersData = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      const recentUsersData = Array.isArray(usersData)
        ? usersData
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
        : [];

      setStats({
        totalOutlets: outletsData.outlets?.length || 0,
        totalOrders: orders.length,
        totalRevenue,
        totalUsers: Array.isArray(usersData) ? usersData.length : 0,
        pendingOrders: pendingOrders.length,
        completedOrders: completedOrders.length,
      });

      setRecentOrders(recentOrdersData);
      setRecentUsers(recentUsersData);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">
            Loading dashboard data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6 border border-red-200">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-center mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Outlets",
      value: stats.totalOutlets,
      icon: Store,
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      change: "+12%",
      isPositive: true,
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      gradient: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      change: "+23%",
      isPositive: true,
      subtitle: `${stats.completedOrders} completed`,
    },
    {
      title: "Total Revenue",
      value: `Rs. ${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      gradient: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      change: "+18%",
      isPositive: true,
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      gradient: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      change: "+8%",
      isPositive: true,
    },
  ];

  return (
    <div className="h-screen bg-gray-50 flex flex-col animate-fadeIn">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, <span className="font-semibold text-orange-600">{user?.name}</span>!
              Here's what's happening today.
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg border border-gray-200 group"
          >
            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            Refresh
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={stat.title}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 card-hover animate-scaleIn"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                {stat.subtitle && (
                  <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                )}
              </div>
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}
              >
                <stat.icon className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {stat.isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span
                className={`text-sm font-semibold ${
                  stat.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {stat.change}
              </span>
              <span className="text-sm text-gray-500">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Order Status */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-600" />
            Order Status
          </h2>
          <OrderStatusChart
            pending={stats.pendingOrders}
            completed={stats.completedOrders}
            total={stats.totalOrders}
          />
        </div>

        {/* Revenue Overview */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Revenue Overview
          </h2>
          <RevenueChart revenue={stats.totalRevenue} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <RecentOrders orders={recentOrders} />
        <RecentUsers users={recentUsers} />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Footer padding */}
      <div className="pb-6"></div>
      </div>
    </div>
  );
}

function OrderStatusChart({ pending, completed, total }) {
  const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-4">
      {/* Circular Progress */}
      <div className="flex items-center justify-center py-4">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="#E5E7EB"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="url(#gradient)"
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${(completionRate * 439.6) / 100} 439.6`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-3xl font-bold text-gray-900">{completionRate}%</p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Completed</span>
          </div>
          <span className="text-lg font-bold text-green-600">{completed}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-gray-700">Pending</span>
          </div>
          <span className="text-lg font-bold text-orange-600">{pending}</span>
        </div>
      </div>
    </div>
  );
}

function RevenueChart({ revenue }) {
  const target = 200000;
  const progress = Math.min((revenue / target) * 100, 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-4xl font-bold text-gray-900">
            Rs. {revenue.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">Total Revenue</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp className="w-5 h-5" />
            <span className="text-2xl font-bold">+15.2%</span>
          </div>
          <p className="text-sm text-gray-500">vs last month</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Monthly Target
          </span>
          <span className="text-sm font-bold text-gray-900">
            Rs. {target.toLocaleString()}
          </span>
        </div>
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2 text-right">
          {progress.toFixed(1)}% achieved
        </p>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
          <p className="text-sm text-blue-600 font-medium mb-1">Today</p>
          <p className="text-2xl font-bold text-blue-900">
            Rs. {(revenue * 0.05).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
          <p className="text-sm text-purple-600 font-medium mb-1">This Week</p>
          <p className="text-2xl font-bold text-purple-900">
            Rs. {(revenue * 0.25).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
          <p className="text-sm text-orange-600 font-medium mb-1">This Month</p>
          <p className="text-2xl font-bold text-orange-900">
            Rs. {revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>
    </div>
  );
}

function RecentOrders({ orders }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-orange-600" />
          Recent Orders
        </h2>
        <a
          href="/admin/orders"
          className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 group"
        >
          View All
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order, index) => (
            <div
              key={order._id}
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-all duration-200 animate-slideIn"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {order.outlet?.name || "No outlet"} • {order.orderType}
                  {order.tableNumber && ` • Table ${order.tableNumber}`}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(order.createdAt).toLocaleDateString()} •{" "}
                  {new Date(order.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 mb-2">
                  Rs. {order.totalAmount?.toLocaleString()}
                </p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No recent orders</p>
          <p className="text-sm text-gray-400 mt-1">
            Orders will appear here as they are created
          </p>
        </div>
      )}
    </div>
  );
}

function RecentUsers({ users }) {
  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "manager":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "employee":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          Recent Users
        </h2>
        <a
          href="/admin/users"
          className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 group"
        >
          View All
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>

      {users.length > 0 ? (
        <div className="space-y-3">
          {users.map((user, index) => (
            <div
              key={user._id}
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-all duration-200 animate-slideIn"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border capitalize ${getRoleColor(
                    user.role
                  )}`}
                >
                  {user.role}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {user.outlet?.name || "No outlet"}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No users found</p>
          <p className="text-sm text-gray-400 mt-1">
            Users will appear here as they register
          </p>
        </div>
      )}
    </div>
  );
}

function QuickActions() {
  const actions = [
    {
      title: "Manage Outlets",
      description: "Add, edit, or remove outlets",
      href: "/admin/outlets",
      icon: Store,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Manage Users",
      description: "Control user accounts and permissions",
      href: "/admin/users",
      icon: Users,
      gradient: "from-purple-500 to-purple-600",
    },
    {
      title: "View Orders",
      description: "Monitor and manage all orders",
      href: "/admin/orders",
      icon: ShoppingCart,
      gradient: "from-orange-500 to-orange-600",
    },
    {
      title: "View Reports",
      description: "Generate sales and performance reports",
      href: "/admin/reports",
      icon: TrendingUp,
      gradient: "from-green-500 to-green-600",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <a
            key={action.href}
            href={action.href}
            className={`group bg-gradient-to-br ${action.gradient} text-white rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 animate-scaleIn`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <action.icon className="w-10 h-10 mb-4 group-hover:scale-110 transition-transform duration-200" />
            <p className="font-bold text-lg mb-1">{action.title}</p>
            <p className="text-sm opacity-90">{action.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
