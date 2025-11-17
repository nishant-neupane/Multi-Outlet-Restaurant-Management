"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../lib/auth-context";

export default function ManagerMenuPage() {
  const { token, user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchMenuItems();
  }, [token]);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch(`/api/menu?outlet=${user?.outlet}`);
      const data = await response.json();
      // ✅ SAFE: Always ensure array
      const safeItems = Array.isArray(data) ? data : (data.items || []);
      setItems(safeItems);
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
      setItems([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (id, currentStatus) => {
    try {
      const item = items.find((i) => i._id === id);
      if (!item) return;

      const response = await fetch(`/api/menu/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...item,
          isAvailable: !currentStatus,
        }),
      });

      if (response.ok) {
        fetchMenuItems();
      }
    } catch (error) {
      console.error("Failed to update menu item:", error);
    }
  };

  // ✅ SAFE: Ensure items is always an array before filtering
  const safeItems = Array.isArray(items) ? items : [];
  const filteredItems =
    selectedCategory === "all"
      ? safeItems
      : safeItems.filter((item) => item.category === selectedCategory);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-color-primary mb-8">
        Menu Management
      </h1>

      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            selectedCategory === "all"
              ? "bg-color-accent text-white"
              : "bg-color-surface text-color-text hover:bg-color-border"
          }`}
        >
          All
        </button>
        {["appetizer", "main", "dessert", "beverage"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg font-semibold transition capitalize ${
              selectedCategory === cat
                ? "bg-color-accent text-white"
                : "bg-color-surface text-color-text hover:bg-color-border"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item._id}
            className="bg-color-background rounded-lg shadow p-6"
          >
            <h3 className="text-lg font-bold text-color-primary mb-2">
              {item.name}
            </h3>
            <p className="text-color-text-light text-sm mb-3">
              {item.description}
            </p>
            <div className="flex justify-between items-center mb-4">
              <span className="text-color-accent font-bold text-lg">
                Rs. {item.price}
              </span>
              <span className="text-xs font-semibold capitalize text-color-text-light">
                {item.category}
              </span>
            </div>
            <button
              onClick={() => toggleAvailability(item._id, item.isAvailable)}
              className={`w-full py-2 rounded-lg font-semibold transition ${
                item.isAvailable
                  ? "bg-color-success text-white hover:bg-green-700"
                  : "bg-color-error text-white hover:bg-red-700"
              }`}
            >
              {item.isAvailable ? "Available" : "Unavailable"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
