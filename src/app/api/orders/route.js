import { connectDB } from "../../../lib/db";
import Order from "../../../models/Order";
import MenuItem from "../../../models/MenuItem";
import Outlet from "../../../models/Outlet";
import User from "../../../models/User";
import { createOrderSchema, orderQuerySchema } from "../../../lib/validations";
import {
  authenticateRequest,
  authorizeOutletAccess,
  validateRequestBody,
  validateQueryParams,
  createResponse,
  createErrorResponse,
  handleApiError,
  createPaginationMeta,
} from "../../../lib/api-helpers";
import { HTTP_STATUS, USER_ROLES } from "../../../lib/constants";

/**
 * GET /api/orders
 * Get orders with pagination and filtering
 * Auth required: All roles
 * Outlet filtering: Admins see all, managers/employees see only their outlet
 */
export async function GET(req) {
  try {
    // Authenticate request
    const auth = authenticateRequest(req);
    if (!auth.authenticated) {
      return auth.error;
    }

    await connectDB();

    // Validate query parameters
    const queryValidation = validateQueryParams(req, orderQuerySchema);
    if (!queryValidation.valid) {
      return queryValidation.error;
    }

    const { page, limit, status, outlet } = queryValidation.data;

    // Build query based on user role
    const query = {};

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Outlet-based filtering
    if (auth.user.role === USER_ROLES.ADMIN) {
      // Admins can filter by any outlet or see all
      if (outlet) {
        query.outlet = outlet;
      }
    } else {
      // Managers and employees can only see their outlet's orders
      if (!auth.user.outlet) {
        return createErrorResponse("User has no outlet assigned", HTTP_STATUS.FORBIDDEN);
      }
      query.outlet = auth.user.outlet;
    }

    // Get total count for pagination
    const total = await Order.countDocuments(query);

    // Fetch orders with pagination
    const orders = await Order.find(query)
      .populate("employee", "name email")
      .populate("outlet", "name location")
      .populate("items.menuItem", "name price category")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    return createResponse({
      orders,
      pagination: createPaginationMeta(page, limit, total),
    });
  } catch (error) {
    return handleApiError(error, "GET orders");
  }
}

/**
 * POST /api/orders
 * Create a new order
 * Auth required: All authenticated users
 * Validates prices against menu items
 */
export async function POST(req) {
  try {
    // Authenticate request
    const auth = authenticateRequest(req);
    if (!auth.authenticated) {
      return auth.error;
    }

    await connectDB();

    // Validate request body
    const validation = await validateRequestBody(req, createOrderSchema);
    if (!validation.valid) {
      return validation.error;
    }

    const { orderType, tableNumber, items, outlet, paymentMethod } = validation.data;

    // Authorize outlet access
    const outletAuth = authorizeOutletAccess(auth.user, outlet);
    if (!outletAuth.authorized) {
      return outletAuth.error;
    }

    // Validate menu items and prices
    const menuItemIds = items.map((item) => item.menuItem);
    const menuItems = await MenuItem.find({
      _id: { $in: menuItemIds },
      outlet: outlet,
    }).lean();

    // Check if all menu items exist
    if (menuItems.length !== items.length) {
      return createErrorResponse("One or more menu items not found", HTTP_STATUS.BAD_REQUEST);
    }

    // Validate prices match menu items
    const menuItemMap = new Map(menuItems.map((item) => [item._id.toString(), item]));

    for (const orderItem of items) {
      const menuItem = menuItemMap.get(orderItem.menuItem.toString());

      if (!menuItem) {
        return createErrorResponse(
          `Menu item ${orderItem.menuItem} not found in this outlet`,
          HTTP_STATUS.BAD_REQUEST
        );
      }

      // Check if menu item is available
      if (!menuItem.isAvailable) {
        return createErrorResponse(
          `Menu item "${menuItem.name}" is not available`,
          HTTP_STATUS.BAD_REQUEST
        );
      }

      // Validate price matches (with small tolerance for floating point)
      if (Math.abs(orderItem.price - menuItem.price) > 0.01) {
        return createErrorResponse(
          `Price mismatch for "${menuItem.name}". Expected ${menuItem.price}, got ${orderItem.price}`,
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Calculate total amount server-side
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Create order
    const order = await Order.create({
      orderNumber,
      outlet,
      employee: auth.user.userId,
      orderType,
      tableNumber: orderType === "dine-in" ? tableNumber : undefined,
      items,
      totalAmount,
      paymentMethod: paymentMethod || undefined,
      status: "pending",
      paymentStatus: "pending",
    });

    // Populate order before returning
    const populatedOrder = await Order.findById(order._id)
      .populate("employee", "name email")
      .populate("outlet", "name location")
      .populate("items.menuItem", "name price category")
      .lean();

    return createResponse(populatedOrder, HTTP_STATUS.CREATED);
  } catch (error) {
    return handleApiError(error, "POST order");
  }
}
