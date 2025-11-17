"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../lib/auth-context";
import {
  FileText,
  Download,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  CheckCircle2,
  Clock,
  Trophy,
} from "lucide-react";

export default function ReportsPage() {
  const { token } = useAuth();
  const [reportData, setReportData] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    completedOrders: 0,
    pendingOrders: 0,
    topDishes: [],
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("today");

  useEffect(() => {
    if (token) {
      fetchReportData();
    }
  }, [token, dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      // Ensure orders is always an array
      const orders = Array.isArray(data) ? data : data.orders || [];

      const totalOrders = orders.length;
      const totalRevenue = orders.reduce(
        (sum, order) => sum + (order.totalAmount || 0),
        0
      );
      const completedOrders = orders.filter((o) => o.status === "paid" || o.status === "completed").length;
      const pendingOrders = orders.filter((o) => o.status === "pending").length;
      const averageOrderValue =
        totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

      const dishCounts = {};
      orders.forEach((order) => {
        const items = Array.isArray(order.items) ? order.items : [];
        items.forEach((item) => {
          const dishName = item.menuItem?.name || item.name || "Unknown";
          dishCounts[dishName] = (dishCounts[dishName] || 0) + (item.quantity || 1);
        });
      });

      const topDishes = Object.entries(dishCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setReportData({
        totalOrders,
        totalRevenue,
        averageOrderValue,
        completedOrders,
        pendingOrders,
        topDishes,
      });
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csv = [
      ["Metric", "Value"],
      ["Total Orders", reportData.totalOrders],
      ["Completed Orders", reportData.completedOrders],
      ["Pending Orders", reportData.pendingOrders],
      ["Total Revenue", `Rs. ${reportData.totalRevenue}`],
      ["Average Order Value", `Rs. ${reportData.averageOrderValue}`],
      [""],
      ["Top Dishes", "Orders"],
      ...reportData.topDishes.map((dish) => [dish.name, dish.count]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `restaurant-report-${dateRange}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const completionRate = reportData.totalOrders > 0
    ? ((reportData.completedOrders / reportData.totalOrders) * 100).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col animate-fadeIn">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <FileText className="w-10 h-10 text-orange-600" />
              Reports & Analytics
            </h1>
            <p className="text-gray-600">
              System-wide sales and performance reports
            </p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Date Range Selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { value: "today", label: "Today" },
            { value: "week", label: "This Week" },
            { value: "month", label: "This Month" },
            { value: "all", label: "All Time" },
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => setDateRange(range.value)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 whitespace-nowrap ${
                dateRange === range.value
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Total Orders",
              value: reportData.totalOrders,
              icon: ShoppingCart,
              gradient: "from-orange-500 to-orange-600",
            },
            {
              title: "Completed Orders",
              value: reportData.completedOrders,
              icon: CheckCircle2,
              gradient: "from-green-500 to-green-600",
            },
            {
              title: "Pending Orders",
              value: reportData.pendingOrders,
              icon: Clock,
              gradient: "from-amber-500 to-amber-600",
            },
            {
              title: "Total Revenue",
              value: `Rs. ${reportData.totalRevenue.toLocaleString()}`,
              icon: DollarSign,
              gradient: "from-blue-500 to-blue-600",
            },
          ].map((stat, index) => (
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
                </div>
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}
                >
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Completion Rate */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Order Completion Rate
            </h2>
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
                  <p className="text-4xl font-bold text-gray-900">{completionRate}%</p>
                  <p className="text-sm text-gray-500">Success Rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Average Order Value */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Average Order Value
            </h2>
            <div className="text-center py-8">
              <p className="text-5xl font-bold text-blue-600 mb-2">
                Rs. {reportData.averageOrderValue.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Per Order</p>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                    <p className="text-lg font-bold text-gray-900">
                      Rs. {reportData.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                    <p className="text-lg font-bold text-gray-900">
                      {reportData.totalOrders}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Dishes */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-600" />
            Top 5 Dishes
          </h2>
          {reportData.topDishes.length > 0 ? (
            <div className="space-y-3">
              {reportData.topDishes.map((dish, index) => (
                <div
                  key={dish.name}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200 animate-slideIn"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0
                          ? "bg-gradient-to-br from-amber-400 to-amber-600"
                          : index === 1
                          ? "bg-gradient-to-br from-gray-300 to-gray-500"
                          : index === 2
                          ? "bg-gradient-to-br from-orange-400 to-orange-600"
                          : "bg-gradient-to-br from-blue-400 to-blue-600"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{dish.name}</p>
                      <p className="text-sm text-gray-500">
                        {dish.count} orders
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-1000"
                        style={{
                          width: `${
                            (dish.count / reportData.topDishes[0].count) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No data available</p>
              <p className="text-sm text-gray-400 mt-1">
                Top dishes will appear here once orders are placed
              </p>
            </div>
          )}
        </div>

        {/* Footer padding */}
        <div className="pb-6"></div>
      </div>
    </div>
  );
}
