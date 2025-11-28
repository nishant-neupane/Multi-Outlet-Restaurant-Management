"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../lib/auth-context";
import {
  UtensilsCrossed,
  Plus,
  Trash2,
  Search,
  DollarSign,
  Tag,
  FileText,
  Filter,
} from "lucide-react";

export default function AdminMenuPage() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "main",
    price: "",
    outlet: "",
    isAvailable: true,
  });

  useEffect(() => {
    if (token) {
      fetchMenuItems();
      fetchOutlets();
    }
  }, [token]);

  const fetchOutlets = async () => {
    try {
      const response = await fetch("/api/outlets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      const outletsList = data.outlets || [];
      setOutlets(outletsList);
      // Set first outlet as default if available
      if (outletsList.length > 0 && !formData.outlet) {
        setFormData(prev => ({ ...prev, outlet: outletsList[0]._id }));
      }
    } catch (error) {
      console.error("Failed to fetch outlets:", error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/menu");
      const data = await response.json();
      // Ensure items is always an array
      setItems(Array.isArray(data) ? data : data.items || []);
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/menu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          outlet: formData.outlet,
        }),
      });

      if (response.ok) {
        setFormData({
          name: "",
          description: "",
          category: "main",
          price: "",
          outlet: outlets.length > 0 ? outlets[0]._id : "",
          isAvailable: true,
        });
        setShowForm(false);
        fetchMenuItems();
      }
    } catch (error) {
      console.error("Failed to create menu item:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`/api/menu/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchMenuItems();
      }
    } catch (error) {
      console.error("Failed to delete menu item:", error);
    }
  };

  const safeItems = Array.isArray(items) ? items : [];

  const filteredItems = safeItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = item.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { value: "all", label: "All Items", icon: UtensilsCrossed },
    { value: "appetizer", label: "Appetizers", icon: UtensilsCrossed },
    { value: "main", label: "Main Course", icon: UtensilsCrossed },
    { value: "dessert", label: "Desserts", icon: UtensilsCrossed },
    { value: "beverage", label: "Beverages", icon: UtensilsCrossed },
  ];

  const getCategoryColor = (category) => {
    switch (category) {
      case "appetizer":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "main":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "dessert":
        return "bg-pink-100 text-pink-700 border-pink-200";
      case "beverage":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200 dark:border-slate-700";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-slate-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-800 font-medium">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-slate-800 flex flex-col animate-fadeIn">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-white dark:bg-slate-800 border-b border-gray-200 px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-950 mb-2 flex items-center gap-3">
              <UtensilsCrossed className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              Menu Management
            </h1>
            <p className="text-gray-800 dark:text-gray-100">
              Create and manage menu items across all outlets
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            {showForm ? "Cancel" : "Add Menu Item"}
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Add Item Form */}
        {showForm && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-100 animate-scaleIn">
            <h2 className="text-xl font-bold text-gray-950 mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Add New Menu Item
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Item Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Delicious Pizza"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Outlet
                  </label>
                  <select
                    value={formData.outlet}
                    onChange={(e) =>
                      setFormData({ ...formData, outlet: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  >
                    <option value="">Select Outlet</option>
                    {outlets.map((outlet) => (
                      <option key={outlet._id} value={outlet._id}>
                        {outlet.name} - {outlet.location}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  >
                    <option value="appetizer">Appetizer</option>
                    <option value="main">Main Course</option>
                    <option value="dessert">Dessert</option>
                    <option value="beverage">Beverage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price (Rs.)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 dark:text-gray-300" />
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="299.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Availability
                  </label>
                  <select
                    value={formData.isAvailable}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isAvailable: e.target.value === "true",
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="true">Available</option>
                    <option value="false">Unavailable</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    rows="3"
                    placeholder="Brief description of the item..."
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 dark:bg-slate-800 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-lg"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Category Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 whitespace-nowrap ${
                selectedCategory === cat.value
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-900 hover:bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 dark:text-gray-300" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search menu items..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Menu Items Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => (
              <div
                key={item._id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 card-hover animate-scaleIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="h-48 bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
                  <UtensilsCrossed className="w-20 h-20 text-white opacity-50" />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-950 flex-1">
                      {item.name}
                    </h3>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 hover:bg-red-50 text-blue-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-800 mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border capitalize ${getCategoryColor(
                        item.category
                      )}`}
                    >
                      {item.category}
                    </span>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${
                        item.isAvailable
                          ? "bg-green-50 text-blue-700 border-blue-200"
                          : "bg-red-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      {item.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    Rs. {item.price?.toLocaleString() || "0"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-12 text-center border border-gray-100 dark:border-slate-700">
            <UtensilsCrossed className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-700 font-medium text-lg">No menu items found</p>
            <p className="text-sm text-gray-600 mt-2">
              {searchTerm
                ? "Try adjusting your search"
                : "Click 'Add Menu Item' to create your first item"}
            </p>
          </div>
        )}

        {/* Footer Stats */}
        <div className="mt-6 text-center text-sm text-gray-700 pb-6">
          Showing {filteredItems.length} of {safeItems.length} items
        </div>
      </div>
    </div>
  );
}
