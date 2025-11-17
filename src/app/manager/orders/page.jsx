"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../lib/auth-context";

export default function ManagerOrdersPage() {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/orders?outlet=${user?.outlet}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders =
    selectedStatus === "all"
      ? orders
      : orders.filter((order) => order.status === selectedStatus);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    served: orders.filter((o) => o.status === "served").length,
    revenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-color-primary mb-8">
        Orders Management
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <StatCard
          title="Total Orders"
          value={stats.total}
          color="bg-color-accent"
        />
        <StatCard title="Pending" value={stats.pending} color="bg-yellow-500" />
        <StatCard
          title="Preparing"
          value={stats.preparing}
          color="bg-blue-500"
        />
        <StatCard
          title="Served"
          value={stats.served}
          color="bg-color-success"
        />
        <StatCard
          title="Revenue"
          value={`Rs. ${stats.revenue}`}
          color="bg-color-warning"
        />
      </div>

      <div className="mb-6 flex gap-2 flex-wrap">
        {["all", "pending", "preparing", "served", "paid"].map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded-lg font-semibold transition capitalize ${
              selectedStatus === status
                ? "bg-color-accent text-white"
                : "bg-color-surface text-color-text hover:bg-color-border"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="bg-color-background rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-color-surface border-b border-color-border">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-color-primary">
                Order #
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-color-primary">
                Type
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-color-primary">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-color-primary">
                Items
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-color-primary">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-color-primary">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr
                key={order._id}
                className="border-b border-color-border hover:bg-color-surface transition"
              >
                <td className="px-6 py-4 text-color-text font-semibold">
                  {order.orderNumber}
                </td>
                <td className="px-6 py-4 text-color-text capitalize">
                  {order.orderType}
                </td>
                <td className="px-6 py-4 text-color-text">
                  {order.employee.name}
                </td>
                <td className="px-6 py-4 text-color-text">
                  {order.items.length} items
                </td>
                <td className="px-6 py-4 text-color-accent font-semibold">
                  Rs. {order.totalAmount}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                      order.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.status === "preparing"
                        ? "bg-blue-100 text-blue-800"
                        : order.status === "served"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className={`${color} rounded-lg shadow p-4 text-white`}>
      <p className="text-xs font-semibold opacity-90">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
