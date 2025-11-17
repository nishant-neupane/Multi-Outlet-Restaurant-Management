import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true, // Index for order number lookups
    },
    outlet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Outlet",
      required: true,
      index: true, // Index for outlet-based queries
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Index for employee queries
    },
    orderType: {
      type: String,
      enum: ["dine-in", "takeaway"],
      required: true,
    },
    tableNumber: {
      type: Number,
      required: function () {
        return this.orderType === "dine-in";
      },
    },
    items: [
      {
        menuItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "preparing", "served", "paid"],
      default: "pending",
      index: true, // Index for status-based queries
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "fonepay", "esewa", "mobile-banking"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
      index: true, // Index for payment status queries
    },
  },
  { timestamps: true }
);

// Compound indexes for common queries
orderSchema.index({ outlet: 1, status: 1 });
orderSchema.index({ outlet: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ outlet: 1, paymentStatus: 1 });

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
