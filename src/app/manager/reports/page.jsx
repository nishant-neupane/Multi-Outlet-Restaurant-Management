"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../lib/auth-context";

export default function ManagerReportsPage() {
  const { token, user } = useAuth();
  const [reportData, setReportData] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    completedOrders: 0,
    topDishes: [],
    employeePerformance: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [token]);

  const fetchReportData = async () => {
    try {
      const response = await fetch(`/api/orders?outlet=${user?.outlet}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      const orders = data.orders || [];

      const totalOrders = orders.length;
      const totalRevenue = orders.reduce(
        (sum, order) => sum + order.totalAmount,
        0
      );
      const completedOrders = orders.filter((o) => o.status === "paid").length;
      const averageOrderValue =
        totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

      const dishCounts = {};
      orders.forEach((order) => {
        order.items.forEach((item) => {
          const dishName = item.menuItem?.name || "Unknown";
          dishCounts[dishName] = (dishCounts[dishName] || 0) + item.quantity;
        });
      });

      const topDishes = Object.entries(dishCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const employeeStats = {};
      orders.forEach((order) => {
        const empName = order.employee?.name || "Unknown";
        if (!employeeStats[empName]) {
          employeeStats[empName] = { orders: 0, revenue: 0 };
        }
        employeeStats[empName].orders += 1;
        employeeStats[empName].revenue += order.totalAmount;
      });

      const employeePerformance = Object.entries(employeeStats)
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.revenue - a.revenue);

      setReportData({
        totalOrders,
        totalRevenue,
        averageOrderValue,
        completedOrders,
        topDishes,
        employeePerformance,
      });
    } catch (error) {
      console.error("Failed to fetch report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const csv = `Manager Report\n\nMetrics\nTotal Orders,${
      reportData.totalOrders
    }\nTotal Revenue,${reportData.totalRevenue}\nAverage Order Value,${
      reportData.averageOrderValue
    }\nCompleted Orders,${
      reportData.completedOrders
    }\n\nTop Dishes\nDish Name,Count\n${reportData.topDishes
      .map((d) => `${d.name},${d.count}`)
      .join(
        "\n"
      )}\n\nEmployee Performance\nEmployee Name,Orders,Revenue\n${reportData.employeePerformance
      .map((e) => `${e.name},${e.orders},${e.revenue}`)
      .join("\n")}`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "manager-report.csv";
    a.click();
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-color-primary">
          Outlet Reports
        </h1>
        <button
          onClick={handleExportCSV}
          className="bg-color-accent hover:bg-color-accent-light text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-color-background rounded-lg shadow p-6">
          <p className="text-sm text-color-text-light">Total Orders</p>
          <p className="text-3xl font-bold text-color-accent mt-2">
            {reportData.totalOrders}
          </p>
        </div>
        <div className="bg-color-background rounded-lg shadow p-6">
          <p className="text-sm text-color-text-light">Total Revenue</p>
          <p className="text-3xl font-bold text-color-success mt-2">
            Rs. {reportData.totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-color-background rounded-lg shadow p-6">
          <p className="text-sm text-color-text-light">Avg Order Value</p>
          <p className="text-3xl font-bold text-color-warning mt-2">
            Rs. {reportData.averageOrderValue}
          </p>
        </div>
        <div className="bg-color-background rounded-lg shadow p-6">
          <p className="text-sm text-color-text-light">Completion Rate</p>
          <p className="text-3xl font-bold text-blue-500 mt-2">
            {reportData.totalOrders > 0
              ? Math.round(
                  (reportData.completedOrders / reportData.totalOrders) * 100
                )
              : 0}
            %
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-color-background rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-color-primary mb-4">
            Top Dishes
          </h2>
          <div className="space-y-3">
            {reportData.topDishes.map((dish, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center pb-3 border-b border-color-border"
              >
                <span className="text-color-text font-semibold">
                  {dish.name}
                </span>
                <span className="bg-color-accent text-white px-3 py-1 rounded-full text-sm font-bold">
                  {dish.count} sold
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-color-background rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-color-primary mb-4">
            Employee Performance
          </h2>
          <div className="space-y-3">
            {reportData.employeePerformance.map((emp, idx) => (
              <div key={idx} className="pb-3 border-b border-color-border">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-color-text font-semibold">
                    {emp.name}
                  </span>
                  <span className="text-color-accent font-bold">
                    Rs. {emp.revenue.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-color-text-light">
                  {emp.orders} orders
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
