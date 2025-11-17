"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../lib/auth-context";
import { toast } from "sonner";
import { ShoppingCart, Plus, Minus, Trash2, Loader2 } from "lucide-react";

export default function EmployeeOrders() {
  const { user, token } = useAuth();
  const [orderType, setOrderType] = useState("dine-in");
  const [tableNumber, setTableNumber] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    if (token && user) {
      fetchMenuItems();
    }
  }, [token, user]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);

      if (!user?.outlet) {
        toast.error("No outlet assigned to your account");
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/menu?outlet=${user.outlet}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch menu: ${response.status}`);
      }

      const data = await response.json();
      const items = data.items || [];
      setMenuItems(items.filter((item) => item.isAvailable));

      if (items.length === 0) {
        toast.info("No menu items available for your outlet");
      }
    } catch (error) {
      console.error("Error fetching menu:", error);
      toast.error(error.message || "Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  const addItem = (item) => {
    const existing = selectedItems.find((i) => i._id === item._id);
    if (existing) {
      setSelectedItems(
        selectedItems.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
    }
    toast.success(`Added ${item.name} to order`);
  };

  const updateQuantity = (id, delta) => {
    setSelectedItems((items) =>
      items
        .map((item) => {
          if (item._id === id) {
            const newQuantity = item.quantity + delta;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeItem = (id) => {
    setSelectedItems(selectedItems.filter((i) => i._id !== id));
    toast.info("Item removed from order");
  };

  const totalAmount = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCreateOrder = async () => {
    if (orderType === "dine-in" && !tableNumber) {
      toast.error("Please select a table number");
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("Please add items to the order");
      return;
    }

    setCreating(true);

    try {
      // For dine-in orders, check if there's an existing active order for this table
      let existingOrder = null;
      if (orderType === "dine-in") {
        const ordersResponse = await fetch(`/api/orders?outlet=${user.outlet}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          const activeOrders = ordersData.orders || [];

          // Find active order for this table (not paid yet)
          existingOrder = activeOrders.find(
            (order) =>
              order.tableNumber === parseInt(tableNumber) &&
              order.orderType === "dine-in" &&
              order.status !== "paid"
          );
        }
      }

      const newItems = selectedItems.map((item) => ({
        menuItem: item._id,
        quantity: item.quantity,
        price: item.price,
      }));

      if (existingOrder) {
        // Add items to existing order
        const updatedItems = [...existingOrder.items, ...newItems];

        const response = await fetch(`/api/orders/${existingOrder._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: updatedItems,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to add items to order");
        }

        toast.success(`Items added to Table ${tableNumber} order!`);
      } else {
        // Create new order
        const orderData = {
          outlet: user.outlet,
          orderType,
          tableNumber: orderType === "dine-in" ? parseInt(tableNumber) : undefined,
          items: newItems,
        };

        const response = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to create order");
        }

        toast.success("Order created successfully!");
      }

      // Reset form
      setSelectedItems([]);
      setTableNumber("");
      setOrderType("dine-in");
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error(error.message || "Failed to create order");
    } finally {
      setCreating(false);
    }
  };

  const filteredMenuItems =
    selectedCategory === "all"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  const categories = [
    { value: "all", label: "All" },
    { value: "appetizer", label: "Appetizers" },
    { value: "main", label: "Main Course" },
    { value: "dessert", label: "Desserts" },
    { value: "beverage", label: "Beverages" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: "var(--color-primary)" }} />
          <p style={{ color: "var(--color-text)" }}>Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: "var(--color-background)" }}>
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8" style={{ color: "var(--color-primary)" }}>
        Create New Order
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        {/* Menu Items Section */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Order Type Selection */}
          <div className="rounded-lg shadow p-4 md:p-6" style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <h2 className="text-lg md:text-xl font-bold mb-4" style={{ color: "var(--color-primary)" }}>
              Order Type
            </h2>
            <div className="flex flex-wrap gap-3 md:gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="dine-in"
                  checked={orderType === "dine-in"}
                  onChange={(e) => setOrderType(e.target.value)}
                  className="mr-2"
                  style={{ accentColor: "var(--color-primary)" }}
                />
                <span style={{ color: "var(--color-text)" }}>Dine-in</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="takeaway"
                  checked={orderType === "takeaway"}
                  onChange={(e) => setOrderType(e.target.value)}
                  className="mr-2"
                  style={{ accentColor: "var(--color-primary)" }}
                />
                <span style={{ color: "var(--color-text)" }}>Takeaway</span>
              </label>
            </div>

            {orderType === "dine-in" && (
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>
                  Table Number
                </label>
                <select
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: "var(--color-background)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text)",
                  }}
                >
                  <option value="">Select a table</option>
                  {Array.from({ length: 20 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1)}>
                      Table {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className="px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all"
                style={{
                  backgroundColor:
                    selectedCategory === cat.value
                      ? "var(--color-primary)"
                      : "var(--color-surface)",
                  color:
                    selectedCategory === cat.value
                      ? "white"
                      : "var(--color-text)",
                  border: `1px solid ${selectedCategory === cat.value ? "var(--color-primary)" : "var(--color-border)"}`,
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div className="rounded-lg shadow p-4 md:p-6" style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <h2 className="text-lg md:text-xl font-bold mb-4" style={{ color: "var(--color-primary)" }}>
              Menu Items
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {filteredMenuItems.length === 0 ? (
                <p className="col-span-2 text-center py-8" style={{ color: "var(--color-textLight)" }}>
                  No items available in this category
                </p>
              ) : (
                filteredMenuItems.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => addItem(item)}
                    className="p-3 md:p-4 rounded-lg transition-all hover:shadow-md text-left"
                    style={{
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-background)",
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-sm md:text-base" style={{ color: "var(--color-text)" }}>
                          {item.name}
                        </p>
                        {item.description && (
                          <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--color-textLight)" }}>
                            {item.description}
                          </p>
                        )}
                      </div>
                      <Plus className="w-5 h-5 ml-2 flex-shrink-0" style={{ color: "var(--color-primary)" }} />
                    </div>
                    <p className="font-bold mt-2" style={{ color: "var(--color-accent)" }}>
                      Rs. {item.price}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="lg:sticky lg:top-4 h-fit">
          <div className="rounded-lg shadow p-4 md:p-6" style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "var(--color-primary)" }}>
              <ShoppingCart className="w-5 h-5" />
              Order Summary
            </h2>

            {selectedItems.length === 0 ? (
              <p className="text-center py-8" style={{ color: "var(--color-textLight)" }}>
                No items added yet
              </p>
            ) : (
              <>
                <div className="space-y-3 mb-4 max-h-64 md:max-h-96 overflow-y-auto">
                  {selectedItems.map((item) => (
                    <div
                      key={item._id}
                      className="pb-3"
                      style={{ borderBottom: "1px solid var(--color-border)" }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
                            {item.name}
                          </p>
                          <p className="text-xs" style={{ color: "var(--color-textLight)" }}>
                            Rs. {item.price} × {item.quantity}
                          </p>
                        </div>
                        <p className="font-bold ml-2" style={{ color: "var(--color-accent)" }}>
                          Rs. {item.price * item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item._id, -1)}
                          className="p-1 rounded"
                          style={{ backgroundColor: "var(--color-background)", border: "1px solid var(--color-border)" }}
                        >
                          <Minus className="w-4 h-4" style={{ color: "var(--color-text)" }} />
                        </button>
                        <span className="w-8 text-center font-semibold" style={{ color: "var(--color-text)" }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, 1)}
                          className="p-1 rounded"
                          style={{ backgroundColor: "var(--color-background)", border: "1px solid var(--color-border)" }}
                        >
                          <Plus className="w-4 h-4" style={{ color: "var(--color-text)" }} />
                        </button>
                        <button
                          onClick={() => removeItem(item._id)}
                          className="ml-auto p-1 rounded"
                          style={{ color: "var(--color-error)" }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 space-y-2" style={{ borderTop: "1px solid var(--color-border)" }}>
                  <div className="flex justify-between text-sm" style={{ color: "var(--color-text)" }}>
                    <span>Subtotal:</span>
                    <span className="font-semibold">Rs. {totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm" style={{ color: "var(--color-text)" }}>
                    <span>Tax (10%):</span>
                    <span className="font-semibold">Rs. {Math.round(totalAmount * 0.1)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2" style={{ borderTop: "1px solid var(--color-border)", color: "var(--color-primary)" }}>
                    <span>Total:</span>
                    <span>Rs. {Math.round(totalAmount * 1.1)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCreateOrder}
                  disabled={creating}
                  className="w-full mt-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "white",
                  }}
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Order"
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
