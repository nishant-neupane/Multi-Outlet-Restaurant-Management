"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardFooter } from "../../../components/ui/button";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import {
  ChefHat,
  ShoppingCart,
  Plus,
  Minus,
  X,
  MapPin,
  Phone,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

export default function PublicMenuPage() {
  const params = useParams();
  const outletId = params.outletId;

  const [outlet, setOutlet] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchOutletAndMenu();
  }, [outletId]);

  const fetchOutletAndMenu = async () => {
    try {
      setLoading(true);

      // Fetch outlet details
      const outletRes = await fetch(`/api/outlets/${outletId}`);
      if (outletRes.ok) {
        const outletData = await outletRes.json();
        setOutlet(outletData);
      }

      // Fetch menu items
      const menuRes = await fetch(`/api/menu?outlet=${outletId}`);
      if (menuRes.ok) {
        const data = await menuRes.json();
        setMenuItems(data.items || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: "all", label: "All Items" },
    { value: "appetizer", label: "Appetizers" },
    { value: "main", label: "Main Course" },
    { value: "dessert", label: "Desserts" },
    { value: "beverage", label: "Beverages" },
    { value: "other", label: "Other" },
  ];

  const filteredItems = selectedCategory === "all"
    ? menuItems.filter(item => item.isAvailable)
    : menuItems.filter(item => item.category === selectedCategory && item.isAvailable);

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem._id === item._id);

    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem._id === item._id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }

    toast.success(`Added ${item.name} to cart`);
  };

  const updateQuantity = (itemId, delta) => {
    setCart(cart.map(item => {
      if (item._id === itemId) {
        const newQuantity = item.quantity + delta;
        if (newQuantity <= 0) {
          return null;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item._id !== itemId));
    toast.info("Item removed from cart");
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="w-16 h-16 text-orange-600 animate-bounce mx-auto mb-4" />
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ChefHat className="w-8 h-8 text-orange-600" />
                <h1 className="text-2xl font-bold text-gray-900">
                  {outlet?.name || "Restaurant Menu"}
                </h1>
              </div>
              {outlet && (
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{outlet.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <span>{outlet.phone}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Open Now</span>
                  </div>
                </div>
              )}
            </div>
            <Button
              className="relative bg-gradient-to-r from-orange-600 to-amber-600"
              onClick={() => {
                if (cartCount > 0) {
                  toast.info("Proceed to checkout");
                }
              }}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Cart
              {cartCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-600">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            {/* Category Tabs */}
            <div className="mb-6">
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="w-full justify-start overflow-x-auto">
                  {categories.map(cat => (
                    <TabsTrigger key={cat.value} value={cat.value}>
                      {cat.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Menu Items Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {filteredItems.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-gray-500">
                  No items available in this category
                </div>
              ) : (
                filteredItems.map(item => (
                  <Card key={item._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      {item.image && (
                        <div className="h-48 bg-gray-200 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          <Badge variant="secondary" className="capitalize">
                            {item.category}
                          </Badge>
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-orange-600">
                            ${item.price.toFixed(2)}
                          </span>
                          <Button
                            onClick={() => addToCart(item)}
                            className="bg-gradient-to-r from-orange-600 to-amber-600"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="lg:sticky lg:top-24 h-fit">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Your Order
                </h2>

                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="w-16 h-16 mx-auto mb-2 opacity-20" />
                    <p>Your cart is empty</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                      {cart.map(item => (
                        <div key={item._id} className="flex items-center gap-3 pb-4 border-b">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-gray-600">
                              ${item.price.toFixed(2)} each
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item._id, -1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item._id, 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromCart(item._id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax (10%)</span>
                        <span>${(cartTotal * 0.1).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t">
                        <span>Total</span>
                        <span className="text-orange-600">
                          ${(cartTotal * 1.1).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-lg py-6">
                      Proceed to Checkout
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
