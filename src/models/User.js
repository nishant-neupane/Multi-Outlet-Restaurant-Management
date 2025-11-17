import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // Index for faster lookups
    },
    password: {
      type: String,
      required: true,
      select: false, // Exclude password from queries by default
    },
    role: {
      type: String,
      enum: ["admin", "manager", "employee"],
      default: "employee",
      index: true, // Index for role-based queries
    },
    outlet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Outlet",
      required: false,
      index: true, // Index for outlet-based queries
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true, // Index for filtering active users
    },
  },
  { timestamps: true }
);

// Compound index for common queries
userSchema.index({ outlet: 1, role: 1 });
userSchema.index({ isActive: 1, role: 1 });

export default mongoose.models.User || mongoose.model("User", userSchema);
