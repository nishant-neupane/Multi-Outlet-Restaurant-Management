import { connectDB } from "../../../../lib/db";
import Order from "../../../../models/Order";
import Outlet from "../../../../models/Outlet";
import User from "../../../../models/User";
import MenuItem from "../../../../models/MenuItem";
import { NextResponse } from "next/server";
import { verifyToken } from "../../../../lib/auth";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const order = await Order.findById(id)
      .populate("employee", "name")
      .populate("outlet", "name")
      .populate("items.menuItem", "name price");

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("GET order error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

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

    const body = await req.json();
    const { status, paymentMethod, paymentStatus, items } = body;

    // Prepare update object
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;

    // If items are being updated, recalculate total amount
    if (items) {
      updateData.items = items;
      updateData.totalAmount = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
    }

    const order = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate("employee", "name")
      .populate("outlet", "name")
      .populate("items.menuItem", "name price");

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("PUT order error:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
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

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("DELETE order error:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
