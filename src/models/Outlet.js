import mongoose from "mongoose";

const outletSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true, // Index for manager queries
    },
    totalTables: {
      type: Number,
      default: 10,
      min: 1,
    },
    theme: {
      type: String,
      enum: ["blue"],
      default: "blue",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true, // Index for filtering active outlets
    },
  },
  { timestamps: true }
);

// Index for active outlets
outletSchema.index({ isActive: 1, name: 1 });

export default mongoose.models.Outlet || mongoose.model("Outlet", outletSchema);
