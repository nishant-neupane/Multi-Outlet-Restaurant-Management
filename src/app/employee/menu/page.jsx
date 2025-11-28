"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../lib/auth-context";

export default function EmployeeMenuPage() {
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
      setItems(data.items || []);
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems =
    selectedCategory === "all"
      ? items
      : items.filter((item) => item.category === selectedCategory);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-color-primary mb-8">
        Menu Reference
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
            className={`rounded-lg shadow p-6 ${
              item.isAvailable
                ? "bg-color-background"
                : "bg-gray-100 opacity-60"
            }`}
          >
            <h3 className="text-lg font-bold text-color-primary mb-2">
              {item.name}
            </h3>
            <p className="text-color-text-light text-sm mb-3">
              {item.description}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-color-accent font-bold text-lg">
                Rs. {item.price}
              </span>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded ${
                  item.isAvailable
                    ? "bg-blue-600 bg-opacity-20 text-color-success"
                    : "bg-color-error bg-opacity-20 text-color-error"
                }`}
              >
                {item.isAvailable ? "Available" : "Unavailable"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
