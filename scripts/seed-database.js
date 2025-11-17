/**
 * Database Seeding Script
 * Creates initial data for testing and demo purposes
 *
 * Run with: node scripts/seed-database.js
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Import models
const User = require("../src/models/User.js").default;
const Outlet = require("../src/models/Outlet.js").default;
const MenuItem = require("../src/models/MenuItem.js").default;
const Order = require("../src/models/Order.js").default;

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in environment variables");
  process.exit(1);
}

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

async function clearDatabase() {
  console.log("🗑️  Clearing existing data...");
  await User.deleteMany({});
  await Outlet.deleteMany({});
  await MenuItem.deleteMany({});
  await Order.deleteMany({});
  console.log("✅ Database cleared");
}

async function seedOutlets() {
  console.log("🏪 Creating outlets...");

  const outlets = await Outlet.create([
    {
      name: "Downtown Branch",
      location: "Thamel, Kathmandu",
      address: "Thamel Marg, Kathmandu 44600",
      phone: "9801234567",
      totalTables: 15,
      isActive: true,
    },
    {
      name: "Lazimpat Branch",
      location: "Lazimpat, Kathmandu",
      address: "Lazimpat Road, Kathmandu 44600",
      phone: "9807654321",
      totalTables: 20,
      isActive: true,
    },
    {
      name: "Patan Branch",
      location: "Jawalakhel, Lalitpur",
      address: "Jawalakhel Chowk, Lalitpur 44700",
      phone: "9809876543",
      totalTables: 12,
      isActive: true,
    },
  ]);

  console.log(`✅ Created ${outlets.length} outlets`);
  return outlets;
}

async function seedUsers(outlets) {
  console.log("👥 Creating users...");

  const hashedPasswordAdmin = await bcrypt.hash("Admin@123", 10);
  const hashedPasswordManager = await bcrypt.hash("Manager@123", 10);
  const hashedPasswordEmployee = await bcrypt.hash("Employee@123", 10);

  const users = await User.create([
    // Admin user
    {
      name: "Admin User",
      email: "admin@demo.com",
      password: hashedPasswordAdmin,
      role: "admin",
      isActive: true,
    },
    // Managers for each outlet
    {
      name: "Manager Downtown",
      email: "manager@demo.com",
      password: hashedPasswordManager,
      role: "manager",
      outlet: outlets[0]._id,
      isActive: true,
    },
    {
      name: "Manager Lazimpat",
      email: "manager.lazimpat@demo.com",
      password: hashedPasswordManager,
      role: "manager",
      outlet: outlets[1]._id,
      isActive: true,
    },
    // Employees for downtown outlet
    {
      name: "Employee Waiter",
      email: "employee@demo.com",
      password: hashedPasswordEmployee,
      role: "employee",
      outlet: outlets[0]._id,
      isActive: true,
    },
    {
      name: "Waiter John",
      email: "john@demo.com",
      password: hashedPasswordEmployee,
      role: "employee",
      outlet: outlets[0]._id,
      isActive: true,
    },
    // Employees for lazimpat outlet
    {
      name: "Waiter Sarah",
      email: "sarah@demo.com",
      password: hashedPasswordEmployee,
      role: "employee",
      outlet: outlets[1]._id,
      isActive: true,
    },
  ]);

  // Update outlet managers
  await Outlet.findByIdAndUpdate(outlets[0]._id, { manager: users[1]._id });
  await Outlet.findByIdAndUpdate(outlets[1]._id, { manager: users[2]._id });

  console.log(`✅ Created ${users.length} users`);
  return users;
}

async function seedMenuItems(outlets) {
  console.log("🍽️  Creating menu items...");

  const menuItems = [];

  // Menu for Downtown Branch
  const downtownMenu = [
    // Appetizers
    { name: "Chicken Momo (Steam)", description: "Delicious steamed chicken dumplings", category: "appetizer", price: 180 },
    { name: "Veg Momo (Fried)", description: "Crispy fried vegetable dumplings", category: "appetizer", price: 150 },
    { name: "Paneer Chilli", description: "Spicy cottage cheese with peppers", category: "appetizer", price: 250 },
    { name: "Spring Rolls", description: "Crispy vegetable spring rolls", category: "appetizer", price: 200 },

    // Main Courses
    { name: "Dal Bhat Set", description: "Traditional Nepali meal with rice, lentils, and curry", category: "main", price: 350 },
    { name: "Chicken Biryani", description: "Aromatic rice with spiced chicken", category: "main", price: 400 },
    { name: "Butter Chicken", description: "Creamy tomato-based chicken curry", category: "main", price: 450 },
    { name: "Veg Thali", description: "Complete vegetarian meal platter", category: "main", price: 300 },
    { name: "Chicken Chowmein", description: "Stir-fried noodles with chicken", category: "main", price: 280 },
    { name: "Fried Rice", description: "Mixed vegetable fried rice", category: "main", price: 220 },

    // Desserts
    { name: "Gulab Jamun", description: "Sweet milk dumplings in syrup", category: "dessert", price: 120 },
    { name: "Rasbari", description: "Cottage cheese balls in sweet milk", category: "dessert", price: 150 },
    { name: "Ice Cream", description: "Vanilla/Chocolate/Strawberry", category: "dessert", price: 100 },

    // Beverages
    { name: "Masala Tea", description: "Spiced milk tea", category: "beverage", price: 50 },
    { name: "Coffee", description: "Hot/Cold coffee", category: "beverage", price: 80 },
    { name: "Fresh Juice", description: "Orange/Apple/Mixed fruit", category: "beverage", price: 120 },
    { name: "Lassi", description: "Sweet/Salty yogurt drink", category: "beverage", price: 100 },
    { name: "Soft Drinks", description: "Coke/Sprite/Fanta", category: "beverage", price: 60 },
  ];

  for (const item of downtownMenu) {
    menuItems.push({
      ...item,
      outlet: outlets[0]._id,
      isAvailable: true,
    });
  }

  // Menu for Lazimpat Branch (similar but with some variations)
  const lazimpatMenu = downtownMenu.map(item => ({
    ...item,
    outlet: outlets[1]._id,
    price: item.price + 20, // Slightly higher prices at Lazimpat
    isAvailable: true,
  }));

  menuItems.push(...lazimpatMenu);

  // Menu for Patan Branch (smaller menu)
  const patanMenu = downtownMenu.slice(0, 12).map(item => ({
    ...item,
    outlet: outlets[2]._id,
    price: item.price - 10, // Slightly lower prices at Patan
    isAvailable: true,
  }));

  menuItems.push(...patanMenu);

  await MenuItem.create(menuItems);
  console.log(`✅ Created ${menuItems.length} menu items across all outlets`);
}

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...\n");

    await connectDB();
    await clearDatabase();

    const outlets = await seedOutlets();
    const users = await seedUsers(outlets);
    await seedMenuItems(outlets);

    console.log("\n✅ Database seeding completed successfully!\n");
    console.log("═══════════════════════════════════════════════════════");
    console.log("📝 Demo Credentials:");
    console.log("═══════════════════════════════════════════════════════");
    console.log("\n👨‍💼 ADMIN:");
    console.log("   Email: admin@demo.com");
    console.log("   Password: Admin@123");
    console.log("\n👔 MANAGER (Downtown):");
    console.log("   Email: manager@demo.com");
    console.log("   Password: Manager@123");
    console.log("\n👔 MANAGER (Lazimpat):");
    console.log("   Email: manager.lazimpat@demo.com");
    console.log("   Password: Manager@123");
    console.log("\n👨‍🍳 EMPLOYEE/WAITER (Downtown):");
    console.log("   Email: employee@demo.com");
    console.log("   Password: Employee@123");
    console.log("\n👨‍🍳 EMPLOYEE (John - Downtown):");
    console.log("   Email: john@demo.com");
    console.log("   Password: Employee@123");
    console.log("\n👩‍🍳 EMPLOYEE (Sarah - Lazimpat):");
    console.log("   Email: sarah@demo.com");
    console.log("   Password: Employee@123");
    console.log("\n═══════════════════════════════════════════════════════");
    console.log("🏪 Outlets:");
    console.log("   • Downtown Branch - Thamel (15 tables)");
    console.log("   • Lazimpat Branch - Lazimpat (20 tables)");
    console.log("   • Patan Branch - Jawalakhel (12 tables)");
    console.log("═══════════════════════════════════════════════════════\n");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("✅ Database connection closed");
    process.exit(0);
  }
}

// Run the seeding
seedDatabase();
