"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../lib/auth-context";
import { THEMES } from "../../../lib/theme-config";

export default function OutletsPage() {
  const { token } = useAuth();
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    address: "",
    phone: "",
    totalTables: "10",
    theme: "orange",
  });

  useEffect(() => {
    fetchOutlets();
  }, [token]);

  // In your OutletsPage component
  const fetchOutlets = async () => {
    try {
      const response = await fetch("/api/outlets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch outlets: ${response.status}`);
      }

      const data = await response.json();

      // Handle both formats for backward compatibility
      if (data.outlets) {
        setOutlets(data.outlets); // New format: { outlets: [...] }
      } else if (Array.isArray(data)) {
        setOutlets(data); // Old format: [...]
      } else {
        console.error("Unexpected data format:", data);
        setOutlets([]);
      }
    } catch (error) {
      console.error("Failed to fetch outlets:", error);
      setOutlets([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (outlet) => {
    setEditingOutlet(outlet);
    setFormData({
      name: outlet.name,
      location: outlet.location,
      address: outlet.address,
      phone: outlet.phone,
      totalTables: outlet.totalTables.toString(),
      theme: outlet.theme || "orange",
    });
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingOutlet(null);
    setFormData({
      name: "",
      location: "",
      address: "",
      phone: "",
      totalTables: "10",
      theme: "orange",
    });
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingOutlet
        ? `/api/outlets/${editingOutlet._id}`
        : "/api/outlets";
      const method = editingOutlet ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          totalTables: parseInt(formData.totalTables),
        }),
      });

      if (response.ok) {
        setFormData({
          name: "",
          location: "",
          address: "",
          phone: "",
          totalTables: "10",
          theme: "orange",
        });
        setShowForm(false);
        setEditingOutlet(null);
        fetchOutlets();
      }
    } catch (error) {
      console.error(`Failed to ${editingOutlet ? 'update' : 'create'} outlet:`, error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-color-primary">
          Outlets Management
        </h1>
        <button
          onClick={() => {
            if (showForm) {
              handleCancelEdit();
            } else {
              setShowForm(true);
            }
          }}
          className="bg-color-accent hover:bg-color-accent-light text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          {showForm ? "Cancel" : "Add Outlet"}
        </button>
      </div>

      {showForm && (
        <div className="bg-color-background rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-color-primary mb-4">
            {editingOutlet ? "Edit Outlet" : "Add New Outlet"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-color-text mb-1">
                  Outlet Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-color-border rounded-lg focus:outline-none focus:ring-2 focus:ring-color-accent"
                  placeholder="e.g., Downtown Branch"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-color-text mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-color-border rounded-lg focus:outline-none focus:ring-2 focus:ring-color-accent"
                  placeholder="e.g., Kathmandu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-color-text mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-color-border rounded-lg focus:outline-none focus:ring-2 focus:ring-color-accent"
                  placeholder="Full address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-color-text mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-color-border rounded-lg focus:outline-none focus:ring-2 focus:ring-color-accent"
                  placeholder="e.g., 01-1234567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-color-text mb-1">
                  Total Tables
                </label>
                <input
                  type="number"
                  value={formData.totalTables}
                  onChange={(e) =>
                    setFormData({ ...formData, totalTables: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-color-border rounded-lg focus:outline-none focus:ring-2 focus:ring-color-accent"
                  placeholder="10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-color-text mb-1">
                  Theme
                </label>
                <select
                  value={formData.theme}
                  onChange={(e) =>
                    setFormData({ ...formData, theme: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-color-border rounded-lg focus:outline-none focus:ring-2 focus:ring-color-accent bg-white"
                >
                  {Object.entries(THEMES).map(([key, theme]) => (
                    <option key={key} value={key}>
                      {theme.name}
                    </option>
                  ))}
                </select>
                <div className="mt-2 flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded border border-color-border"
                    style={{
                      backgroundColor: THEMES[formData.theme].light.primary,
                    }}
                  />
                  <span className="text-xs text-color-text-light">
                    Preview: {THEMES[formData.theme].name}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-color-accent hover:bg-color-accent-light text-white font-semibold py-2 rounded-lg transition"
            >
              {editingOutlet ? "Update Outlet" : "Add Outlet"}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {outlets.map((outlet) => (
          <div
            key={outlet._id}
            className="bg-color-background rounded-lg shadow p-6"
          >
            <h3 className="text-lg font-bold text-color-primary mb-2">
              {outlet.name}
            </h3>
            <div className="space-y-2 text-sm text-color-text-light mb-4">
              <p>Location: {outlet.location}</p>
              <p>Address: {outlet.address}</p>
              <p>Phone: {outlet.phone}</p>
              <p>Tables: {outlet.totalTables}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-sm font-medium">Theme:</span>
                <div
                  className="w-5 h-5 rounded border border-color-border"
                  style={{
                    backgroundColor: THEMES[outlet.theme || "orange"].light.primary,
                  }}
                />
                <span className="text-sm">
                  {THEMES[outlet.theme || "orange"].name}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  outlet.isActive
                    ? "bg-color-success bg-opacity-20 text-white"
                    : "bg-color-error bg-opacity-20 text-white"
                }`}
              >
                {outlet.isActive ? "Active" : "Inactive"}
              </span>
              <button
                onClick={() => handleEdit(outlet)}
                className="ml-auto px-4 py-1 bg-color-primary hover:bg-color-primary-hover text-white text-sm font-semibold rounded transition"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
