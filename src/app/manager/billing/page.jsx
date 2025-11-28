"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../lib/auth-context";
import { toast } from "sonner";

export default function ManagerBillingPage() {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [tableGroups, setTableGroups] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [payment, setPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchServedOrders();
  }, [token]);

  const fetchServedOrders = async () => {
    try {
      const response = await fetch("/api/orders?status=served", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      const servedOrders = data.orders || [];
      setOrders(servedOrders);

      // Group orders by table number
      const grouped = servedOrders.reduce((acc, order) => {
        if (order.orderType === "dine-in" && order.tableNumber) {
          const tableNum = order.tableNumber;
          if (!acc[tableNum]) {
            acc[tableNum] = {
              tableNumber: tableNum,
              orders: [],
              totalAmount: 0,
              items: [],
            };
          }
          acc[tableNum].orders.push(order);
          acc[tableNum].totalAmount += order.totalAmount;
          acc[tableNum].items.push(...order.items);
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

  const handleSelectTable = (table) => {
    setSelectedTable(table);
    setPayment(null);
    setShowQR(false);
    setEditMode(false);
  };

  const handleRemoveItem = async (orderIndex, itemIndex) => {
    if (!selectedTable) return;

    try {
      const order = selectedTable.orders[orderIndex];
      const updatedItems = order.items.filter((_, idx) => idx !== itemIndex);

      if (updatedItems.length === 0) {
        await fetch(`/api/orders/${order._id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("Order removed");
      } else {
        await fetch(`/api/orders/${order._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ items: updatedItems }),
        });
        toast.success("Item removed");
      }

      fetchServedOrders();
      setSelectedTable(null);
    } catch (error) {
      console.error("Failed to remove item:", error);
      toast.error("Failed to remove item");
    }
  };

  const handleUpdateQuantity = async (orderIndex, itemIndex, newQuantity) => {
    if (!selectedTable || newQuantity < 1) return;

    try {
      const order = selectedTable.orders[orderIndex];
      const updatedItems = [...order.items];
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        quantity: newQuantity,
      };

      await fetch(`/api/orders/${order._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: updatedItems }),
      });

      toast.success("Quantity updated");
      fetchServedOrders();
    } catch (error) {
      console.error("Failed to update quantity:", error);
      toast.error("Failed to update quantity");
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
      toast.success(`Table ${selectedTable.tableNumber} bill paid successfully!`);
      setSelectedTable(null);
      setPayment(null);
      fetchServedOrders();
    } catch (error) {
      console.error("Failed to confirm payment:", error);
      toast.error("Failed to confirm payment");
    }
  };

  const calculateTax = (amount) => Math.round(amount * 0.1);
  const calculateTotal = (amount) => amount + calculateTax(amount);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold text-color-primary mb-6 md:mb-8">
        Billing & Payments
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-6">
        <div className="lg:col-span-2">
          <div className="bg-color-background rounded-lg shadow p-4 md:p-6 mb-6">
            <h2 className="text-lg md:text-xl font-bold text-color-primary mb-4">
              Tables with Unpaid Orders
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {tableGroups.length === 0 ? (
                <p className="text-color-text-light text-center py-8">
                  No tables waiting for payment
                </p>
              ) : (
                tableGroups.map((table) => (
                  <button
                    key={table.tableNumber}
                    onClick={() => handleSelectTable(table)}
                    className={`w-full p-4 rounded-lg text-left transition ${
                      selectedTable?.tableNumber === table.tableNumber
                        ? "bg-color-accent text-white"
                        : "bg-color-surface hover:bg-color-border"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-base md:text-lg">
                          Table {table.tableNumber}
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg md:text-xl font-bold text-color-primary">
                  Table {selectedTable.tableNumber}
                </h2>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className={`px-3 py-1 rounded text-sm font-semibold transition ${
                    editMode
                      ? "bg-gray-200 text-gray-700 dark:text-gray-200"
                      : "bg-blue-50 dark:bg-slate-8000 text-white hover:bg-blue-600"
                  }`}
                >
                  {editMode ? "Done" : "Edit Order"}
                </button>
              </div>

              <div className="mb-4 pb-4 border-b border-color-border">
                <p className="text-sm text-color-text-light">
                  {selectedTable.orders.length} order(s) combined
                </p>
              </div>

              <div className="mb-4 pb-4 border-b border-color-border max-h-64 overflow-y-auto">
                {selectedTable.orders.map((order, orderIdx) => (
                  <div key={order._id} className="mb-3">
                    {selectedTable.orders.length > 1 && (
                      <p className="text-xs text-color-text-light mb-1">
                        Order #{order.orderNumber}
                      </p>
                    )}
                    {order.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="flex justify-between items-center text-sm mb-2 gap-2"
                      >
                        {editMode ? (
                          <>
                            <div className="flex items-center gap-2 flex-1">
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(
                                    orderIdx,
                                    itemIdx,
                                    item.quantity - 1
                                  )
                                }
                                className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-semibold">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(
                                    orderIdx,
                                    itemIdx,
                                    item.quantity + 1
                                  )
                                }
                                className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                              >
                                +
                              </button>
                              <span className="text-color-text">
                                {item.menuItem.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-color-accent font-semibold">
                                Rs. {item.price * item.quantity}
                              </span>
                              <button
                                onClick={() => handleRemoveItem(orderIdx, itemIdx)}
                                className="w-6 h-6 rounded bg-blue-100 hover:bg-red-200 text-blue-600 flex items-center justify-center"
                              >
                                ×
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="text-color-text">
                              {item.quantity}x {item.menuItem.name}
                            </span>
                            <span className="text-color-accent font-semibold">
                              Rs. {item.price * item.quantity}
                            </span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="mb-4 pb-4 border-b border-color-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-color-text">Subtotal:</span>
                  <span className="font-semibold">
                    Rs. {selectedTable.totalAmount}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-color-text">Tax (10%):</span>
                  <span className="font-semibold">
                    Rs. {calculateTax(selectedTable.totalAmount)}
                  </span>
                </div>
              </div>

              <p className="text-lg md:text-xl font-bold text-color-accent mb-4">
                Total: Rs. {calculateTotal(selectedTable.totalAmount)}
              </p>

              {!payment ? (
                <>
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
                    onClick={async () => {
                      if (paymentMethod !== "cash") {
                        try {
                          const response = await fetch("/api/payments", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                              orderId: selectedTable.orders[0]._id,
                              amount: calculateTotal(selectedTable.totalAmount),
                              method: paymentMethod,
                            }),
                          });

                          if (response.ok) {
                            const data = await response.json();
                            setPayment(data);
                            setShowQR(true);
                            toast.success("QR Code generated!");
                          } else {
                            toast.error("Failed to generate QR code");
                          }
                        } catch (error) {
                          console.error("Failed to generate QR:", error);
                          toast.error("Failed to generate QR code");
                        }
                      } else {
                        handleConfirmPayment();
                      }
                    }}
                    className="w-full bg-color-accent hover:bg-color-accent-light text-white font-semibold py-2 rounded-lg transition"
                  >
                    {paymentMethod === "cash" ? "Confirm Cash Payment" : "Generate QR Code"}
                  </button>
                </>
              ) : (
                <>
                  {showQR && payment.qrCode && (
                    <div className="mb-4 p-4 bg-white dark:bg-slate-800 rounded-lg border-2 border-color-accent text-center">
                      <p className="text-sm font-semibold text-color-primary mb-3">
                        Scan QR Code to Pay
                      </p>
                      <div className="bg-white dark:bg-slate-800 p-2 rounded inline-block">
                        <img
                          src={payment.qrCode}
                          alt="Payment QR Code"
                          className="w-48 h-48 mx-auto"
                        />
                      </div>
                      <p className="text-xs text-color-text-light mt-3">
                        Total: Rs. {calculateTotal(selectedTable.totalAmount)}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <button
                      onClick={handleConfirmPayment}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
                    >
                      Confirm Payment Received
                    </button>
                    <button
                      onClick={() => {
                        setPayment(null);
                        setShowQR(false);
                      }}
                      className="w-full bg-color-border hover:bg-gray-300 text-color-text font-semibold py-2 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
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
