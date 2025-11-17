import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import MenuItem from "../src/models/MenuItem.js";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

const seedMenuItems = async () => {
  try {
    console.log("🍽️  Creating sample menu items...\n");

    // Your outlet ID from the database
    const outletId = "691a40baa89f4288f96d1dce";

    const menuItemsData = [
      // Appetizers
      { name: "Spring Rolls", description: "Crispy vegetable spring rolls", category: "appetizer", price: 250, image: "" },
      { name: "Chicken Wings", description: "Spicy buffalo wings", category: "appetizer", price: 450, image: "" },
      { name: "Momo (Veg)", description: "Steamed vegetable dumplings", category: "appetizer", price: 180, image: "" },
      { name: "Momo (Chicken)", description: "Steamed chicken dumplings", category: "appetizer", price: 220, image: "" },
      { name: "French Fries", description: "Crispy golden fries", category: "appetizer", price: 200, image: "" },
      { name: "Onion Rings", description: "Crispy fried onion rings", category: "appetizer", price: 220, image: "" },

      // Main Course
      { name: "Dal Bhat Set", description: "Traditional Nepali meal set", category: "main", price: 350, image: "" },
      { name: "Chicken Curry", description: "Spicy chicken curry with rice", category: "main", price: 450, image: "" },
      { name: "Butter Chicken", description: "Creamy butter chicken", category: "main", price: 550, image: "" },
      { name: "Veg Biryani", description: "Aromatic vegetable biryani", category: "main", price: 400, image: "" },
      { name: "Chicken Biryani", description: "Aromatic chicken biryani", category: "main", price: 500, image: "" },
      { name: "Pizza Margherita", description: "Classic cheese pizza", category: "main", price: 650, image: "" },
      { name: "Chicken Pizza", description: "Chicken and cheese pizza", category: "main", price: 750, image: "" },
      { name: "Burger Special", description: "Juicy beef burger with fries", category: "main", price: 550, image: "" },
      { name: "Grilled Chicken", description: "Marinated grilled chicken", category: "main", price: 600, image: "" },
      { name: "Fish & Chips", description: "Battered fish with fries", category: "main", price: 650, image: "" },
      { name: "Pasta Carbonara", description: "Creamy pasta with bacon", category: "main", price: 500, image: "" },
      { name: "Fried Rice", description: "Chicken fried rice", category: "main", price: 380, image: "" },

      // Desserts
      { name: "Ice Cream Sundae", description: "Vanilla ice cream with toppings", category: "dessert", price: 250, image: "" },
      { name: "Chocolate Cake", description: "Rich chocolate cake", category: "dessert", price: 300, image: "" },
      { name: "Gulab Jamun", description: "Sweet milk dumplings", category: "dessert", price: 150, image: "" },
      { name: "Cheesecake", description: "Creamy New York cheesecake", category: "dessert", price: 400, image: "" },
      { name: "Brownie", description: "Fudgy chocolate brownie", category: "dessert", price: 280, image: "" },
      { name: "Tiramisu", description: "Italian coffee dessert", category: "dessert", price: 350, image: "" },

      // Beverages
      { name: "Coca Cola", description: "Chilled soft drink", category: "beverage", price: 100, image: "" },
      { name: "Sprite", description: "Lemon-lime soft drink", category: "beverage", price: 100, image: "" },
      { name: "Fresh Juice", description: "Seasonal fresh juice", category: "beverage", price: 200, image: "" },
      { name: "Lassi", description: "Traditional yogurt drink", category: "beverage", price: 150, image: "" },
      { name: "Coffee", description: "Hot coffee", category: "beverage", price: 120, image: "" },
      { name: "Tea", description: "Hot tea", category: "beverage", price: 80, image: "" },
      { name: "Mineral Water", description: "Bottled water", category: "beverage", price: 50, image: "" },
      { name: "Mango Shake", description: "Fresh mango milkshake", category: "beverage", price: 180, image: "" },
    ];

    // Create menu items for the outlet
    const menuItems = menuItemsData.map(item => ({
      ...item,
      outlet: outletId,
      isAvailable: true,
    }));

    await MenuItem.deleteMany({ outlet: outletId });
    const created = await MenuItem.create(menuItems);

    console.log(`✅ Created ${created.length} menu items for outlet ${outletId}\n`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎉 MENU ITEMS SEEDED SUCCESSFULLY!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log("📊 Summary:");
    console.log(`   • Appetizers: ${menuItems.filter(i => i.category === 'appetizer').length}`);
    console.log(`   • Main Course: ${menuItems.filter(i => i.category === 'main').length}`);
    console.log(`   • Desserts: ${menuItems.filter(i => i.category === 'dessert').length}`);
    console.log(`   • Beverages: ${menuItems.filter(i => i.category === 'beverage').length}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  } catch (error) {
    console.error("❌ Error seeding menu items:", error);
    throw error;
  }
};

const main = async () => {
  try {
    await connectDB();
    await seedMenuItems();
    console.log("\n✨ Done! Refresh your orders page to see the menu items.");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Seeding failed:", error);
    process.exit(1);
  }
};

main();
