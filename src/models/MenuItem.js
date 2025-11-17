import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["appetizer", "main", "dessert", "beverage", "other"],
      index: true, // Index for category filtering
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
    },
    outlet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Outlet",
      required: true,
      index: true, // Index for outlet-based queries
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true, // Index for filtering available items
    },
  },
  { timestamps: true }
);

// Compound indexes for common queries
menuItemSchema.index({ outlet: 1, category: 1 });
menuItemSchema.index({ outlet: 1, isAvailable: 1 });
menuItemSchema.index({ category: 1, isAvailable: 1 });

export default mongoose.models.MenuItem || mongoose.model("MenuItem", menuItemSchema);
