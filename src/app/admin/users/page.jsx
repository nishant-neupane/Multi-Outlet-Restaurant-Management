"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../../lib/auth-context";
import {
  Users,
  UserPlus,
  Mail,
  Lock,
  User,
  Building2,
  Search,
  Filter,
  X,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function UsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    outlet: "",
  });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchOutlets();
    }
  }, [token]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      // Ensure users is always an array
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOutlets = async () => {
    try {
      const response = await fetch("/api/outlets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setOutlets(Array.isArray(data) ? data : data.outlets || []);
    } catch (error) {
      console.error("Failed to fetch outlets:", error);
      setOutlets([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({
          name: "",
          email: "",
          password: "",
          role: "employee",
          outlet: "",
        });
        setShowForm(false);
        fetchUsers();
      } else {
        const error = await response.json();
        setFormError(error.error || "Failed to create user");
      }
    } catch (error) {
      console.error("Failed to create user:", error);
      setFormError("Failed to create user. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  // Ensure users is array before filtering
  const safeUsers = Array.isArray(users) ? users : [];

  const filteredUsers = safeUsers.filter((user) => {
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const roleStats = {
    all: safeUsers.length,
    admin: safeUsers.filter((u) => u.role === "admin").length,
    manager: safeUsers.filter((u) => u.role === "manager").length,
    employee: safeUsers.filter((u) => u.role === "employee").length,
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "manager":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "employee":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200 dark:border-slate-700";
    }
  };

  const getRoleGradient = (role) => {
    switch (role) {
      case "admin":
        return "from-blue-500 to-blue-600";
      case "manager":
        return "from-blue-500 to-blue-600";
      case "employee":
        return "from-blue-500 to-blue-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-800 font-medium">Loading users...</p>
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
              <Users className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              Users Management
            </h1>
            <p className="text-gray-800 dark:text-gray-100">
              Manage all user accounts and permissions across the system
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-lg"
          >
            <UserPlus className="w-5 h-5" />
            {showForm ? "Cancel" : "Add User"}
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">

      {/* Add User Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-950 flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                Add New User
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-700 dark:text-gray-200" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {formError && (
                <div className="bg-red-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-blue-700 text-sm">{formError}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 dark:text-gray-300" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 dark:text-gray-300" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 dark:text-gray-300" />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="••••••••"
                      required
                      minLength={8}
                    />
                  </div>
                  <p className="text-xs text-gray-700 mt-1">
                    Minimum 8 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {formData.role !== "admin" && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Outlet
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 dark:text-gray-300" />
                      <select
                        value={formData.outlet}
                        onChange={(e) =>
                          setFormData({ ...formData, outlet: e.target.value })
                        }
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required={formData.role !== "admin"}
                      >
                        <option value="">Select an outlet</option>
                        {outlets.map((outlet) => (
                          <option key={outlet._id} value={outlet._id}>
                            {outlet.name} - {outlet.location}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
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
                  disabled={formLoading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {formLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Create User
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "All Users", value: roleStats.all, role: "all", gradient: "from-gray-500 to-gray-600" },
          { label: "Admins", value: roleStats.admin, role: "admin", gradient: "from-blue-500 to-blue-600" },
          { label: "Managers", value: roleStats.manager, role: "manager", gradient: "from-blue-500 to-blue-600" },
          { label: "Employees", value: roleStats.employee, role: "employee", gradient: "from-blue-500 to-blue-600" },
        ].map((stat, index) => (
          <button
            key={stat.role}
            onClick={() => setSelectedRole(stat.role)}
            className={`bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 border-2 transition-all duration-200 hover:shadow-lg animate-scaleIn ${
              selectedRole === stat.role
                ? "border-blue-500"
                : "border-transparent"
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-sm font-medium text-gray-800 mb-1">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-gray-950 dark:text-white">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
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
            placeholder="Search by name or email..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-950 dark:text-white">
                  User
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-950 dark:text-white">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-950 dark:text-white">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-950 dark:text-white">
                  Outlet
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-950 dark:text-white">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-950 dark:text-white">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <tr
                    key={user._id}
                    className="border-b border-gray-100 hover:bg-gray-50 dark:bg-slate-800 transition-colors animate-slideIn"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRoleGradient(
                            user.role
                          )} flex items-center justify-center text-white font-bold shadow-md`}
                        >
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-950 dark:text-white">
                            {user.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700 dark:text-gray-200">{user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border capitalize ${getRoleColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700 dark:text-gray-200">
                        {user.outlet?.name || "N/A"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                          user.isActive
                            ? "bg-green-50 text-blue-700 border-blue-200"
                            : "bg-red-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {user.isActive ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-800 dark:text-gray-100">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12">
                    <div className="text-center">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-700 font-medium">
                        No users found
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {searchTerm
                          ? "Try adjusting your search"
                          : "Click 'Add User' to create your first user"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="mt-6 text-center text-sm text-gray-700 pb-6">
        Showing {filteredUsers.length} of {safeUsers.length} users
      </div>
      </div>
    </div>
  );
}
