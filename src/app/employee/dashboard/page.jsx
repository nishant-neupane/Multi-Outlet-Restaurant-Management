"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
import {
  ShoppingCart,
  DollarSign,
  Clock,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  Package
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function EmployeeDashboard() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token && user) {
      fetchDashboardData();
    }
  }, [token, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch orders for today
      const ordersResponse = await fetch("/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        const orders = ordersData.orders || [];

        // Filter orders for today
        const today = new Date().toDateString();
        const todayOrders = orders.filter(order =>
          new Date(order.createdAt).toDateString() === today
        );

        // Calculate stats
        const pendingOrders = todayOrders.filter(o => o.status === "pending").length;
        const preparingOrders = todayOrders.filter(o => o.status === "preparing").length;
        const servedOrders = todayOrders.filter(o => o.status === "served").length;
        const totalRevenue = todayOrders
          .filter(o => o.paymentStatus === "completed")
          .reduce((sum, o) => sum + o.totalAmount, 0);

        setStats({
          totalOrders: todayOrders.length,
          pending: pendingOrders,
          preparing: preparingOrders,
          served: servedOrders,
          revenue: totalRevenue,
        });

        // Get 5 most recent orders
        setRecentOrders(orders.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: "destructive", label: "Pending" },
      preparing: { variant: "default", label: "Preparing" },
      served: { variant: "default", label: "Served" },
      paid: { variant: "default", label: "Paid" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's your performance overview for today
          </p>
        </div>
        <Button
          onClick={() => router.push("/employee/orders")}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-amber-700"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Create Order
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">Today's orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting preparation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preparing</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.preparing || 0}</div>
            <p className="text-xs text-muted-foreground">In kitchen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.revenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Today's earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>
            Your most recent orders from all time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No orders yet. Create your first order!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => router.push("/employee/active-orders")}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{order.orderNumber}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {order.orderType === "dine-in"
                        ? `Table ${order.tableNumber}`
                        : "Takeaway"}{" "}
                      • {order.items.length} items
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(order.totalAmount)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push("/employee/orders")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              New Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create a new order for dine-in or takeaway
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push("/employee/active-orders")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Active Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View and manage all active orders
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push("/employee/performance")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Check your sales performance and stats
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
