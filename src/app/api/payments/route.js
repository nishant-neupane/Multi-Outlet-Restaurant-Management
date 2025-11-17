import { connectDB } from "../../../lib/db";
import Payment from "../../../models/Payment";
import Order from "../../../models/Order";
import { NextResponse } from "next/server";
import { verifyToken } from "../../../lib/auth";
import { generateQRCode } from "../../../lib/qr-generator";

export async function GET(req) {
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

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("order");

    const query = {};
    if (orderId) query.order = orderId;

    const payments = await Payment.find(query).populate("order");

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Failed to fetch payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
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

    const { orderId, amount, method } = await req.json();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const paymentData = {
      orderId,
      amount,
      method,
      timestamp: new Date().toISOString(),
    };

    let qrCode = "";
    if (["fonepay", "esewa", "mobile-banking"].includes(method)) {
      qrCode = await generateQRCode(JSON.stringify(paymentData));
    }

    const payment = await Payment.create({
      order: orderId,
      amount,
      method,
      status: "pending",
      qrCode,
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("Failed to create payment:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
