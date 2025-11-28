"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../lib/auth-context";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  Trophy,
  RefreshCw,
  Store,
} from "lucide-react";

export default function ManagerDashboard() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    activeOrders: 0,
    completedOrders: 0,
    topDish: "",
    completionRate: 0,
    averageOrderValue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token && user?.role === "manager") {
      fetchDashboardData();
      const interval = setInterval(fetchDashboardData, 30000);
      return () => clearInterval(interval);
    } else if (user && user.role !== "manager") {
      router.push("/unauthorized");
    }
  }, [token, user, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const ordersResponse = await fetch(`/api/orders?outlet=${user?.outlet}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!ordersResponse.ok) throw new Error("Failed to fetch orders data");

      const data = await ordersResponse.json();

      // ✅ SAFE: Always ensure array
      const orders = Array.isArray(data) ? data : (data.orders || []);

      const today = new Date();
      const startOfToday = new Date(today.setHours(0, 0, 0, 0));
      const endOfToday = new Date(today.setHours(23, 59, 59, 999));

      const todayOrdersArr = orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startOfToday && orderDate <= endOfToday;
      });

      const todayRevenue = todayOrdersArr.reduce(
        (sum, order) => sum + (order.totalAmount || 0),
        0
      );

      const activeOrders = orders.filter(
        (o) => o.status === "pending" || o.status === "preparing" || o.status === "served"
      ).length;

      const completedOrders = orders.filter(
        (o) => o.status === "completed" || o.paymentStatus === "completed"
      ).length;

      const totalOrders = orders.length;
      const completionRate =
        totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0;

      const averageOrderValue =
        todayOrdersArr.length > 0 ? Math.round(todayRevenue / todayOrdersArr.length) : 0;

      // Calculate top dish from orders
      const dishCounts = {};
      orders.forEach((order) => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item) => {
            const dishName = item.menuItem?.name || "Unknown";
            dishCounts[dishName] = (dishCounts[dishName] || 0) + (item.quantity || 1);
          });
        }
      });

      const topDish = Object.entries(dishCounts).length > 0
        ? Object.entries(dishCounts)
            .sort((a, b) => b[1] - a[1])[0][0]
        : "No orders yet";

      const recentOrdersData = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setStats({
        todayOrders: todayOrdersArr.length,
        todayRevenue,
        activeOrders,
        completedOrders,
        completionRate,
        averageOrderValue,
        topDish,
      });

      setRecentOrders(recentOrdersData);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-slate-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-800 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-slate-800 min-h-screen">
        <div className="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-blue-200">
          <p className="text-blue-600 text-center mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-slate-800 flex flex-col animate-fadeIn">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-white dark:bg-slate-800 border-b border-gray-200 px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-950 !dark:text-white mb-2 flex items-center gap-3">
              <Store className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              Manager Dashboard
            </h1>
            <p className="text-gray-800 dark:text-gray-100">
              Welcome, <span className="font-semibold text-blue-600 dark:text-blue-400">{user?.name}</span>! Today's overview
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 bg-gray-100 text-gray-900 font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg border border-gray-200 group"
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
          {[
            {
              title: "Today's Orders",
              value: stats.todayOrders,
              icon: ShoppingCart,
              gradient: "from-blue-500 to-blue-600",
              change: "+15%",
            },
            {
              title: "Today's Revenue",
              value: `Rs. ${stats.todayRevenue.toLocaleString()}`,
              icon: DollarSign,
              gradient: "from-blue-500 to-blue-600",
              change: "+12%",
            },
            {
              title: "Active Orders",
              value: stats.activeOrders,
              icon: Clock,
              gradient: "from-blue-500 to-indigo-600",
              change: stats.activeOrders,
            },
            {
              title: "Completion Rate",
              value: `${stats.completionRate}%`,
              icon: CheckCircle2,
              gradient: "from-blue-500 to-blue-600",
              change: "Great!",
            },
          ].map((stat, index) => (
            <div
              key={stat.title}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 card-hover animate-scaleIn"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-800 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-950 !dark:text-white">{stat.value}</p>
                </div>
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}
                >
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{stat.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 mb-6">
          <h2 className="text-xl font-bold text-gray-950 !dark:text-white mb-6 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Recent Orders
          </h2>
          {recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order, index) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 rounded-xl border border-gray-200 transition-all duration-200 animate-slideIn"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div>
                    <p className="font-semibold text-gray-950 !dark:text-white">{order.orderNumber}</p>
                    <p className="text-sm text-gray-800 dark:text-gray-100">{order.orderType}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-950 !dark:text-white">Rs. {order.totalAmount?.toLocaleString()}</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:text-blue-300">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-700 font-medium">No orders yet</p>
            </div>
          )}
        </div>

        <div className="pb-6"></div>
      </div>
    </div>
  );
}
