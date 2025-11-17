"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../lib/auth-context";
import StatCard from "../../../components/StatCard"; // Import StatCard component

export default function PerformancePage() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    completedOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceStats();
  }, [token]);

  const fetchPerformanceStats = async () => {
    try {
      const response = await fetch("/api/orders", {
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

      setStats({
        totalOrders,
        totalRevenue,
        averageOrderValue,
        completedOrders,
      });
    } catch (error) {
      console.error("Failed to fetch performance stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-color-primary mb-8">
        My Performance
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          color="bg-color-accent"
        />
        <StatCard
          title="Completed Orders"
          value={stats.completedOrders}
          color="bg-color-success"
        />
        <StatCard
          title="Total Revenue"
          value={`Rs. ${stats.totalRevenue.toLocaleString()}`}
          color="bg-color-warning"
        />
        <StatCard
          title="Avg Order Value"
          value={`Rs. ${stats.averageOrderValue}`}
          color="bg-blue-500"
        />
      </div>

      <div className="bg-color-background rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-color-primary mb-4">
          Performance Summary
        </h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-color-border">
            <span className="text-color-text">Completion Rate:</span>
            <span className="text-lg font-bold text-color-accent">
              {stats.totalOrders > 0
                ? Math.round((stats.completedOrders / stats.totalOrders) * 100)
                : 0}
              %
            </span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-color-border">
            <span className="text-color-text">Total Revenue Generated:</span>
            <span className="text-lg font-bold text-color-accent">
              Rs. {stats.totalRevenue.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-color-text">Average Order Value:</span>
            <span className="text-lg font-bold text-color-accent">
              Rs. {stats.averageOrderValue}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
