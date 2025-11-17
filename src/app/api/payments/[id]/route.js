import { connectDB } from "../../../../lib/db";
import Payment from "../../../../models/Payment";
import Order from "../../../../models/Order";
import { NextResponse } from "next/server";
import { verifyToken } from "../../../../lib/auth";

export async function PUT(req, { params }) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const { status, transactionId } = await req.json();

    const payment = await Payment.findByIdAndUpdate(
      id,
      { status, transactionId },
      { new: true }
    ).populate("order");

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (status === "completed") {
      await Order.findByIdAndUpdate(payment.order._id, {
        paymentStatus: "completed",
      });
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Failed to update payment:", error);
    return NextResponse.json(
      { error: "Failed to update payment" },
      { status: 500 }
    );
  }
}
