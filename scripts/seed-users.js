import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import User from "../src/models/User.js";

// Hash password function (inline to avoid loading auth.js before dotenv)
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    console.log("👥 Creating users...\n");

    // Hash password "a" for all users
    const hashedPassword = await hashPassword("a");

    // Your outlet IDs from the database
    const downtownOutletId = "691a40baa89f4288f96d1dce";
    const lazimpatOutletId = "691a40baa89f4288f96d1dcf";

    const users = [
      // Admin
      {
        name: "Admin User",
        email: "admin@demo.com",
        password: hashedPassword,
        role: "admin",
        isActive: true,
      },

      // Managers
      {
        name: "Manager Downtown",
        email: "manager@demo.com",
        password: hashedPassword,
        role: "manager",
        outlet: downtownOutletId,
        isActive: true,
      },
      {
        name: "Manager Lazimpat",
        email: "manager.lazimpat@demo.com",
        password: hashedPassword,
        role: "manager",
        outlet: lazimpatOutletId,
        isActive: true,
      },

      // Employees - Downtown
      {
        name: "Employee Waiter",
        email: "employee@demo.com",
        password: hashedPassword,
        role: "employee",
        outlet: downtownOutletId,
        isActive: true,
      },
      {
        name: "Waiter John",
        email: "john@demo.com",
        password: hashedPassword,
        role: "employee",
        outlet: downtownOutletId,
        isActive: true,
      },
      {
        name: "Waiter Alice",
        email: "alice@demo.com",
        password: hashedPassword,
        role: "employee",
        outlet: downtownOutletId,
        isActive: true,
      },

      // Employees - Lazimpat
      {
        name: "Waiter Sarah",
        email: "sarah@demo.com",
        password: hashedPassword,
        role: "employee",
        outlet: lazimpatOutletId,
        isActive: true,
      },
      {
        name: "Waiter Mike",
        email: "mike@demo.com",
        password: hashedPassword,
        role: "employee",
        outlet: lazimpatOutletId,
        isActive: true,
      },
    ];

    // Clear existing users
    await User.deleteMany({});
    console.log("🗑️  Cleared existing users");

    // Create new users
    const createdUsers = await User.create(users);

    console.log(`✅ Created ${createdUsers.length} users\n`);

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎉 USERS SEEDED SUCCESSFULLY!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("📊 Summary:");
    console.log(`   • Admins: ${users.filter(u => u.role === 'admin').length}`);
    console.log(`   • Managers: ${users.filter(u => u.role === 'manager').length}`);
    console.log(`   • Employees: ${users.filter(u => u.role === 'employee').length}\n`);

    console.log("👤 Login Credentials (Password: a):");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("   🔑 Admin:");
    console.log("      Email: admin@demo.com");
    console.log("      Password: a\n");
    console.log("   👔 Manager (Downtown):");
    console.log("      Email: manager@demo.com");
    console.log("      Password: a\n");
    console.log("   👔 Manager (Lazimpat):");
    console.log("      Email: manager.lazimpat@demo.com");
    console.log("      Password: a\n");
    console.log("   👨‍💼 Employee (Downtown):");
    console.log("      Email: employee@demo.com");
    console.log("      Password: a\n");
    console.log("   👨‍💼 Employee (Downtown - John):");
    console.log("      Email: john@demo.com");
    console.log("      Password: a\n");
    console.log("   👨‍💼 Employee (Downtown - Alice):");
    console.log("      Email: alice@demo.com");
    console.log("      Password: a\n");
    console.log("   👨‍💼 Employee (Lazimpat - Sarah):");
    console.log("      Email: sarah@demo.com");
    console.log("      Password: a\n");
    console.log("   👨‍💼 Employee (Lazimpat - Mike):");
    console.log("      Email: mike@demo.com");
    console.log("      Password: a");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    throw error;
  }
};

const main = async () => {
  try {
    await connectDB();
    await seedUsers();
    console.log("\n✨ Done! You can now login with any of the accounts above.");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Seeding failed:", error);
    process.exit(1);
  }
};

main();
