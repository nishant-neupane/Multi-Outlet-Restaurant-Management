"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../../../lib/auth-context"
import { toast } from "sonner"

export default function ActiveOrdersPage() {
  const { token, user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState("all")

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 5000)
    return () => clearInterval(interval)
  }, [token])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch orders")
      }

      const data = await response.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error("Failed to fetch orders:", error)
      if (loading) {
        toast.error("Failed to load orders")
      }
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const statusMessages = {
          preparing: "Order moved to preparing",
          served: "Order marked as served",
          paid: "Order marked as paid"
        }
        toast.success(statusMessages[newStatus] || "Order updated successfully")
        fetchOrders()
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast.error(errorData.error || "Failed to update order status")
      }
    } catch (error) {
      console.error("Failed to update order:", error)
      toast.error("Failed to update order status")
    }
  }

  const filteredOrders =
    selectedStatus === "all" ? orders : orders.filter((order) => order.status === selectedStatus)

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-color-primary mb-8">Active Orders</h1>

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.map((order) => (
          <div key={order._id} className="bg-color-background rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-color-text-light">Order #{order.orderNumber}</p>
                <p className="text-lg font-bold text-color-primary">{order.orderType.toUpperCase()}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                  order.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : order.status === "preparing"
                    ? "bg-blue-100 text-blue-800"
                    : order.status === "served"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800 dark:text-gray-100"
                }`}
              >
                {order.status}
              </span>
            </div>

            {order.tableNumber && <p className="text-sm text-color-text-light mb-3">Table {order.tableNumber}</p>}

            <div className="mb-4 pb-4 border-b border-color-border">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm mb-2">
                  <span className="text-color-text">
                    {item.quantity}x {item.menuItem.name}
                  </span>
                  <span className="text-color-accent font-semibold">Rs. {item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <p className="text-lg font-bold text-color-accent mb-4">Total: Rs. {order.totalAmount}</p>

            <div className="space-y-2">
              {order.status === "pending" && (
                <button
                  onClick={() => updateOrderStatus(order._id, "preparing")}
                  className="w-full bg-color-accent hover:bg-color-accent-light text-white font-semibold py-2 rounded-lg transition"
                >
                  Start Preparing
                </button>
              )}
              {order.status === "preparing" && (
                <button
                  onClick={() => updateOrderStatus(order._id, "served")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
                >
                  Mark as Served
                </button>
              )}
              {order.status === "served" && (
                <div className="w-full bg-blue-50 dark:bg-slate-800 text-blue-700 font-semibold py-2 rounded-lg text-center">
                  Go to Billing page to process payment
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-color-text-light text-lg">No orders found</p>
        </div>
      )}
    </div>
  )
}
