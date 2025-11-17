"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Alert, AlertDescription } from "../components/ui/alert";
import { ChefHat, Mail, Lock, User, Building2, ArrowRight, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  const [outlets, setOutlets] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    outlet: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (activeTab === "signup") {
      fetchOutlets();
    }
  }, [activeTab]);

  const fetchOutlets = async () => {
    try {
      const response = await fetch("/api/outlets");
      const data = await response.json();
      if (response.ok) {
        setOutlets(data.outlets || data);
      }
    } catch (error) {
      console.error("Error fetching outlets:", error);
    }
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const validateForm = () => {
    if (activeTab === "login") {
      if (!formData.email || !formData.password) {
        setError("Email and password are required");
        return false;
      }
    } else {
      if (!formData.name || !formData.email || !formData.password) {
        setError("All fields are required");
        return false;
      }
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters");
        return false;
      }
      if (formData.role !== "admin" && !formData.outlet) {
        setError("Please select an outlet");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const endpoint = activeTab === "login" ? "/api/auth/login" : "/api/auth/signup";
      const payload = activeTab === "login"
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setError(data.errors.map(err => err.message).join(", "));
        } else {
          setError(data.error || "An error occurred");
        }
        return;
      }

      // Store token and user data using auth context
      authLogin(data.token, data.user);

      // Show success message
      toast.success(activeTab === "login" ? "Welcome back!" : "Account created successfully!");

      // Navigate based on role
      const role = data.user?.role;
      if (role === "admin") {
        router.push("/admin/dashboard");
      } else if (role === "manager") {
        router.push("/manager/dashboard");
      } else {
        router.push("/employee/dashboard");
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex flex-col">
      {/* Header */}
      <header className="p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              RestaurantOS
            </span>
          </div>
          <Button
            variant="ghost"
            onClick={() => router.push("/landing")}
          >
            Learn More
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <div className="hidden lg:block">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-orange-600" />
                <span className="text-sm font-semibold text-orange-600 uppercase tracking-wide">
                  Modern Restaurant Management
                </span>
              </div>
              <h1 className="text-5xl font-bold leading-tight">
                Manage Your
                <br />
                <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Restaurant Empire
                </span>
              </h1>
              <p className="text-xl text-gray-600">
                Complete restaurant management solution with real-time order tracking,
                menu management, and powerful analytics.
              </p>
              <div className="space-y-3 pt-4">
                {[
                  "Multi-outlet management",
                  "Real-time order tracking",
                  "Comprehensive analytics",
                  "Role-based access control",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div>
            <Card className="border-2 shadow-2xl">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Welcome</CardTitle>
                <CardDescription className="text-center">
                  Sign in to your account or create a new one
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>

                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit}>
                    <TabsContent value="login" className="space-y-4 mt-0">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            className="pl-10"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="login-password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => handleChange("password", e.target.value)}
                            className="pl-10"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            Sign In
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </TabsContent>

                    <TabsContent value="signup" className="space-y-4 mt-0">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="signup-name"
                            type="text"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            className="pl-10"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            className="pl-10"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="signup-password"
                            type="password"
                            placeholder="Min. 8 characters"
                            value={formData.password}
                            onChange={(e) => handleChange("password", e.target.value)}
                            className="pl-10"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-role">Role</Label>
                        <Select
                          value={formData.role}
                          onValueChange={(value) => handleChange("role", value)}
                          disabled={loading}
                        >
                          <SelectTrigger id="signup-role">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employee">Employee</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.role !== "admin" && (
                        <div className="space-y-2">
                          <Label htmlFor="signup-outlet">Outlet</Label>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                            <Select
                              value={formData.outlet}
                              onValueChange={(value) => handleChange("outlet", value)}
                              disabled={loading}
                            >
                              <SelectTrigger id="signup-outlet" className="pl-10">
                                <SelectValue placeholder="Select outlet" />
                              </SelectTrigger>
                              <SelectContent>
                                {outlets.map((outlet) => (
                                  <SelectItem key={outlet._id} value={outlet._id}>
                                    {outlet.name} - {outlet.location}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          <>
                            Create Account
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </TabsContent>
                  </form>
                </Tabs>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="text-sm text-center text-gray-500">
                  By signing in, you agree to our Terms of Service and Privacy Policy
                </div>
              </CardFooter>
            </Card>

            {/* Demo Credentials */}
            <Card className="mt-4 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
              <CardContent className="pt-6">
                <p className="text-sm font-semibold text-orange-800 mb-2">Demo Credentials:</p>
                <div className="space-y-1 text-sm text-gray-700">
                  <p><strong>Admin:</strong> admin@demo.com / Admin@123</p>
                  <p><strong>Manager:</strong> manager@demo.com / Manager@123</p>
                  <p><strong>Employee:</strong> employee@demo.com / Employee@123</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-gray-500">
        © 2024 RestaurantOS. All rights reserved.
      </footer>
    </div>
  );
}
