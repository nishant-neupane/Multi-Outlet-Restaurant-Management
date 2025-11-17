import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Import models
import User from "../src/models/User.js";
import Outlet from "../src/models/Outlet.js";
import MenuItem from "../src/models/MenuItem.js";
import Order from "../src/models/Order.js";
import { hashPassword } from "../src/lib/auth.js";

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Clear all data
const clearData = async () => {
  try {
    await User.deleteMany({});
    await Outlet.deleteMany({});
    await MenuItem.deleteMany({});
    await Order.deleteMany({});
    console.log("🗑️  Cleared all existing data");
  } catch (error) {
    console.error("❌ Error clearing data:", error);
    throw error;
  }
};

// Seed data
const seedData = async () => {
  try {
    console.log("🌱 Starting database seeding...\n");

    // Clear existing data
    await clearData();

    // 1. Create Outlets
    console.log("📍 Creating outlets...");
    const outlets = await Outlet.create([
      {
        name: "Downtown Branch",
        location: "Thamel, Kathmandu",
        address: "Thamel Marg, Kathmandu 44600",
        phone: "+977-1-4123456",
        totalTables: 20,
        isActive: true,
      },
      {
        name: "Lakeside Branch",
        location: "Lakeside, Pokhara",
        address: "Lakeside Road 6, Pokhara 33700",
        phone: "+977-61-234567",
        totalTables: 15,
        isActive: true,
      },
      {
        name: "Airport Branch",
        location: "Tribhuvan Airport",
        address: "TIA Domestic Terminal, Kathmandu",
        phone: "+977-1-4567890",
        totalTables: 10,
        isActive: true,
      },
    ]);
    console.log(`✅ Created ${outlets.length} outlets\n`);

    // 2. Create Users
    console.log("👥 Creating users...");
    const hashedPassword = await hashPassword("password123");

    // Create admin
    const admin = await User.create({
      name: "Admin User",
      email: "admin@restaurant.com",
      password: hashedPassword,
      role: "admin",
      isActive: true,
    });

    // Create managers for each outlet
    const managers = await User.create([
      {
        name: "John Manager",
        email: "john@restaurant.com",
        password: hashedPassword,
        role: "manager",
        outlet: outlets[0]._id,
        isActive: true,
      },
      {
        name: "Sarah Manager",
        email: "sarah@restaurant.com",
        password: hashedPassword,
        role: "manager",
        outlet: outlets[1]._id,
        isActive: true,
      },
      {
        name: "Mike Manager",
        email: "mike@restaurant.com",
        password: hashedPassword,
        role: "manager",
        outlet: outlets[2]._id,
        isActive: true,
      },
    ]);

    // Update outlets with managers
    await Outlet.findByIdAndUpdate(outlets[0]._id, { manager: managers[0]._id });
    await Outlet.findByIdAndUpdate(outlets[1]._id, { manager: managers[1]._id });
    await Outlet.findByIdAndUpdate(outlets[2]._id, { manager: managers[2]._id });

    // Create employees for each outlet
    const employees = await User.create([
      // Downtown employees
      {
        name: "Alice Employee",
        email: "alice@restaurant.com",
        password: hashedPassword,
        role: "employee",
        outlet: outlets[0]._id,
        isActive: true,
      },
      {
        name: "Bob Employee",
        email: "bob@restaurant.com",
        password: hashedPassword,
        role: "employee",
        outlet: outlets[0]._id,
        isActive: true,
      },
      // Lakeside employees
      {
        name: "Charlie Employee",
        email: "charlie@restaurant.com",
        password: hashedPassword,
        role: "employee",
        outlet: outlets[1]._id,
        isActive: true,
      },
      {
        name: "Diana Employee",
        email: "diana@restaurant.com",
        password: hashedPassword,
        role: "employee",
        outlet: outlets[1]._id,
        isActive: true,
      },
      // Airport employees
      {
        name: "Eve Employee",
        email: "eve@restaurant.com",
        password: hashedPassword,
        role: "employee",
        outlet: outlets[2]._id,
        isActive: true,
      },
    ]);

    console.log(`✅ Created 1 admin, ${managers.length} managers, and ${employees.length} employees\n`);

    // 3. Create Menu Items
    console.log("🍽️  Creating menu items...");
    const menuItemsData = [
      // Appetizers
      { name: "Spring Rolls", description: "Crispy vegetable spring rolls", category: "appetizer", price: 250 },
      { name: "Chicken Wings", description: "Spicy buffalo wings", category: "appetizer", price: 450 },
      { name: "Momo (Veg)", description: "Steamed vegetable dumplings", category: "appetizer", price: 180 },
      { name: "Momo (Chicken)", description: "Steamed chicken dumplings", category: "appetizer", price: 220 },
      { name: "French Fries", description: "Crispy golden fries", category: "appetizer", price: 200 },

      // Main Course
      { name: "Dal Bhat Set", description: "Traditional Nepali meal set", category: "main", price: 350 },
      { name: "Chicken Curry", description: "Spicy chicken curry with rice", category: "main", price: 450 },
      { name: "Butter Chicken", description: "Creamy butter chicken", category: "main", price: 550 },
      { name: "Veg Biryani", description: "Aromatic vegetable biryani", category: "main", price: 400 },
      { name: "Chicken Biryani", description: "Aromatic chicken biryani", category: "main", price: 500 },
      { name: "Pizza Margherita", description: "Classic cheese pizza", category: "main", price: 650 },
      { name: "Chicken Pizza", description: "Chicken and cheese pizza", category: "main", price: 750 },
      { name: "Burger Special", description: "Juicy beef burger with fries", category: "main", price: 550 },
      { name: "Grilled Chicken", description: "Marinated grilled chicken", category: "main", price: 600 },
      { name: "Fish & Chips", description: "Battered fish with fries", category: "main", price: 650 },

      // Desserts
      { name: "Ice Cream Sundae", description: "Vanilla ice cream with toppings", category: "dessert", price: 250 },
      { name: "Chocolate Cake", description: "Rich chocolate cake", category: "dessert", price: 300 },
      { name: "Gulab Jamun", description: "Sweet milk dumplings", category: "dessert", price: 150 },
      { name: "Cheesecake", description: "Creamy New York cheesecake", category: "dessert", price: 400 },
      { name: "Brownie", description: "Fudgy chocolate brownie", category: "dessert", price: 280 },

      // Beverages
      { name: "Coca Cola", description: "Chilled soft drink", category: "beverage", price: 100 },
      { name: "Fresh Juice", description: "Seasonal fresh juice", category: "beverage", price: 200 },
      { name: "Lassi", description: "Traditional yogurt drink", category: "beverage", price: 150 },
      { name: "Coffee", description: "Hot coffee", category: "beverage", price: 120 },
      { name: "Tea", description: "Hot tea", category: "beverage", price: 80 },
      { name: "Mineral Water", description: "Bottled water", category: "beverage", price: 50 },
    ];

    // Create menu items for each outlet
    const allMenuItems = [];
    for (const outlet of outlets) {
      for (const item of menuItemsData) {
        allMenuItems.push({
          ...item,
          outlet: outlet._id,
          isAvailable: Math.random() > 0.1, // 90% available
        });
      }
    }

    const menuItems = await MenuItem.create(allMenuItems);
    console.log(`✅ Created ${menuItems.length} menu items across all outlets\n`);

    // 4. Create Sample Orders
    console.log("📦 Creating sample orders...");
    const orders = [];
    const orderStatuses = ["pending", "preparing", "served", "paid"];
    const paymentMethods = ["cash", "card", "fonepay", "esewa"];

    // Create 20 orders for each outlet
    for (let i = 0; i < outlets.length; i++) {
      const outlet = outlets[i];
      const outletMenuItems = menuItems.filter(
        (item) => item.outlet.toString() === outlet._id.toString()
      );
      const outletEmployees = employees.filter(
        (emp) => emp.outlet.toString() === outlet._id.toString()
      );

      for (let j = 0; j < 20; j++) {
        const orderType = Math.random() > 0.5 ? "dine-in" : "takeaway";
        const numItems = Math.floor(Math.random() * 4) + 1; // 1-4 items
        const selectedItems = [];
        let totalAmount = 0;

        // Randomly select menu items
        for (let k = 0; k < numItems; k++) {
          const randomItem =
            outletMenuItems[Math.floor(Math.random() * outletMenuItems.length)];
          const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
          selectedItems.push({
            menuItem: randomItem._id,
            quantity,
            price: randomItem.price,
          });
          totalAmount += randomItem.price * quantity;
        }

        const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
        const employee = outletEmployees[Math.floor(Math.random() * outletEmployees.length)];

        orders.push({
          orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          outlet: outlet._id,
          employee: employee._id,
          orderType,
          tableNumber: orderType === "dine-in" ? Math.floor(Math.random() * outlet.totalTables) + 1 : undefined,
          items: selectedItems,
          status,
          totalAmount,
          paymentMethod: status === "paid" ? paymentMethods[Math.floor(Math.random() * paymentMethods.length)] : undefined,
          paymentStatus: status === "paid" ? "completed" : "pending",
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last 7 days
        });
      }
    }

    const createdOrders = await Order.create(orders);
    console.log(`✅ Created ${createdOrders.length} sample orders\n`);

    // Print summary
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎉 DATABASE SEEDING COMPLETED!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log("📊 Summary:");
    console.log(`   • Outlets: ${outlets.length}`);
    console.log(`   • Users: ${1 + managers.length + employees.length}`);
    console.log(`   • Menu Items: ${menuItems.length}`);
    console.log(`   • Orders: ${createdOrders.length}\n`);
    console.log("👤 Login Credentials:");
    console.log("   Admin:");
    console.log("      Email: admin@restaurant.com");
    console.log("      Password: password123\n");
    console.log("   Manager (Downtown):");
    console.log("      Email: john@restaurant.com");
    console.log("      Password: password123\n");
    console.log("   Employee (Downtown):");
    console.log("      Email: alice@restaurant.com");
    console.log("      Password: password123\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  }
};

// Main function
const main = async () => {
  try {
    await connectDB();
    await seedData();
    console.log("\n✨ All done! You can now log in with the credentials above.");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Seeding failed:", error);
    process.exit(1);
  }
};

main();
