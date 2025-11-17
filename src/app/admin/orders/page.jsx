"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../lib/auth-context";
import { toast } from "sonner";

export default function AdminOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedOutlet, setSelectedOutlet] = useState("all");
  const [outlets, setOutlets] = useState([]);

  useEffect(() => {
    fetchOutlets();
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchOutlets = async () => {
    try {
      const response = await fetch("/api/outlets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setOutlets(data.outlets || []);
    } catch (error) {
      console.error("Failed to fetch outlets:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders", {
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

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrders();
      } else {
        toast.error("Failed to update order status");
      }
    } catch (error) {
      console.error("Failed to update order:", error);
      toast.error("Failed to update order status");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const statusMatch =
      selectedStatus === "all" || order.status === selectedStatus;
    const outletMatch =
      selectedOutlet === "all" || order.outlet._id === selectedOutlet;
    return statusMatch && outletMatch;
  });

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold text-color-primary mb-6">
        All Orders (System-Wide)
      </h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-color-text mb-2">
            Filter by Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-4 py-2 border border-color-border rounded-lg focus:outline-none focus:ring-2 focus:ring-color-accent"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="served">Served</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-color-text mb-2">
            Filter by Outlet
          </label>
          <select
            value={selectedOutlet}
            onChange={(e) => setSelectedOutlet(e.target.value)}
            className="w-full px-4 py-2 border border-color-border rounded-lg focus:outline-none focus:ring-2 focus:ring-color-accent"
          >
            <option value="all">All Outlets</option>
            {outlets.map((outlet) => (
              <option key={outlet._id} value={outlet._id}>
                {outlet.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-color-text-light text-lg">No orders found</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-color-background rounded-lg shadow p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs text-color-text-light">
                    {order.orderNumber}
                  </p>
                  <p className="font-semibold text-color-primary">
                    {order.outlet.name}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
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
              </div>

              <div className="mb-3">
                <p className="text-sm text-color-text-light mb-1">
                  {order.orderType.toUpperCase()}
                  {order.tableNumber && ` - Table ${order.tableNumber}`}
                </p>
                <p className="text-xs text-color-text-light">
                  {order.items.length} items
                </p>
              </div>

              <div className="mb-3 max-h-24 overflow-y-auto">
                {order.items.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs mb-1">
                    <span className="text-color-text">
                      {item.quantity}x {item.menuItem.name}
                    </span>
                    <span className="text-color-accent">
                      Rs. {item.price * item.quantity}
                    </span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <p className="text-xs text-color-text-light">
                    +{order.items.length - 3} more items
                  </p>
                )}
              </div>

              <p className="text-lg font-bold text-color-accent mb-3">
                Total: Rs. {order.totalAmount}
              </p>

              <div className="space-y-2">
                {order.status === "pending" && (
                  <button
                    onClick={() => updateOrderStatus(order._id, "preparing")}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2 rounded-lg transition"
                  >
                    Start Preparing
                  </button>
                )}
                {order.status === "preparing" && (
                  <button
                    onClick={() => updateOrderStatus(order._id, "served")}
                    className="w-full bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2 rounded-lg transition"
                  >
                    Mark as Served
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
