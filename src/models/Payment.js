import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true, // Index for order lookups
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    method: {
      type: String,
      enum: ["cash", "card", "fonepay", "esewa", "mobile-banking"],
      required: true,
      index: true, // Index for payment method queries
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
      index: true, // Index for status queries
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true, // Sparse index allows multiple null values
    },
    qrCode: {
      type: String,
    },
  },
  { timestamps: true }
);

// Compound indexes
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ method: 1, status: 1 });

export default mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
