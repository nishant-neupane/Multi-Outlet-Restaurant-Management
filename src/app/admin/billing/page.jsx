"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../lib/auth-context";
import { toast } from "sonner";

export default function AdminBillingPage() {
  const { token } = useAuth();
  const [tableGroups, setTableGroups] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(true);
  const [selectedOutlet, setSelectedOutlet] = useState("all");
  const [outlets, setOutlets] = useState([]);

  useEffect(() => {
    fetchOutlets();
    fetchServedOrders();
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

  const fetchServedOrders = async () => {
    try {
      const response = await fetch("/api/orders?status=served", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      const servedOrders = data.orders || [];

      // Group orders by table and outlet
      const grouped = servedOrders.reduce((acc, order) => {
        if (order.orderType === "dine-in" && order.tableNumber) {
          const key = `${order.outlet._id}-${order.tableNumber}`;
          if (!acc[key]) {
            acc[key] = {
              tableNumber: order.tableNumber,
              outletId: order.outlet._id,
              outletName: order.outlet.name,
              orders: [],
              totalAmount: 0,
              items: [],
            };
          }
          acc[key].orders.push(order);
          acc[key].totalAmount += order.totalAmount;
          acc[key].items.push(...order.items);
        }
        return acc;
      }, {});

      setTableGroups(Object.values(grouped));
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedTable) return;

    try {
      const promises = selectedTable.orders.map((order) =>
        fetch(`/api/orders/${order._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "paid",
            paymentMethod: paymentMethod,
            paymentStatus: "completed",
          }),
        })
      );

      await Promise.all(promises);
      toast.success(
        `${selectedTable.outletName} - Table ${selectedTable.tableNumber} paid!`
      );
      setSelectedTable(null);
      fetchServedOrders();
    } catch (error) {
      console.error("Failed to confirm payment:", error);
      toast.error("Failed to confirm payment");
    }
  };

  const calculateTax = (amount) => Math.round(amount * 0.1);
  const calculateTotal = (amount) => amount + calculateTax(amount);

  const filteredTables =
    selectedOutlet === "all"
      ? tableGroups
      : tableGroups.filter((table) => table.outletId === selectedOutlet);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold text-color-primary mb-6">
        System-Wide Billing (Admin)
      </h1>

      {/* Outlet Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-color-text mb-2">
          Filter by Outlet
        </label>
        <select
          value={selectedOutlet}
          onChange={(e) => setSelectedOutlet(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-color-border rounded-lg focus:outline-none focus:ring-2 focus:ring-color-accent"
        >
          <option value="all">All Outlets</option>
          {outlets.map((outlet) => (
            <option key={outlet._id} value={outlet._id}>
              {outlet.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-color-background rounded-lg shadow p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-color-primary mb-4">
              Tables with Unpaid Orders ({filteredTables.length})
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredTables.length === 0 ? (
                <p className="text-color-text-light text-center py-8">
                  No tables waiting for payment
                </p>
              ) : (
                filteredTables.map((table, idx) => (
                  <button
                    key={`${table.outletId}-${table.tableNumber}`}
                    onClick={() => setSelectedTable(table)}
                    className={`w-full p-4 rounded-lg text-left transition ${
                      selectedTable?.outletId === table.outletId &&
                      selectedTable?.tableNumber === table.tableNumber
                        ? "bg-color-accent text-white"
                        : "bg-color-surface hover:bg-color-border"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-base">
                          {table.outletName} - Table {table.tableNumber}
                        </p>
                        <p className="text-sm opacity-75">
                          {table.items.length} items • {table.orders.length} order(s)
                        </p>
                      </div>
                      <p className="font-bold text-lg">Rs. {table.totalAmount}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-color-background rounded-lg shadow p-4 md:p-6 h-fit">
          {selectedTable ? (
            <>
              <h2 className="text-lg font-bold text-color-primary mb-4">
                {selectedTable.outletName} - Table {selectedTable.tableNumber}
              </h2>

              <div className="mb-4 pb-4 border-b border-color-border">
                <p className="text-sm text-color-text-light">
                  {selectedTable.orders.length} order(s) combined
                </p>
              </div>

              <div className="mb-4 pb-4 border-b border-color-border max-h-48 overflow-y-auto">
                {selectedTable.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm mb-2">
                    <span className="text-color-text">
                      {item.quantity}x {item.menuItem.name}
                    </span>
                    <span className="text-color-accent font-semibold">
                      Rs. {item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mb-4 pb-4 border-b border-color-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-color-text">Subtotal:</span>
                  <span className="font-semibold">Rs. {selectedTable.totalAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-color-text">Tax (10%):</span>
                  <span className="font-semibold">
                    Rs. {calculateTax(selectedTable.totalAmount)}
                  </span>
                </div>
              </div>

              <p className="text-lg font-bold text-color-accent mb-4">
                Total: Rs. {calculateTotal(selectedTable.totalAmount)}
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-color-text mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 border border-color-border rounded-lg focus:outline-none focus:ring-2 focus:ring-color-accent"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="fonepay">Fonepay</option>
                  <option value="esewa">eSewa</option>
                  <option value="mobile-banking">Mobile Banking</option>
                </select>
              </div>

              <button
                onClick={handleConfirmPayment}
                className="w-full bg-color-success hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
              >
                Confirm Payment
              </button>
            </>
          ) : (
            <p className="text-color-text-light text-center py-8">
              Select a table to process payment
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
