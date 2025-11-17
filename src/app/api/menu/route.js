import { connectDB } from "../../../lib/db";
import MenuItem from "../../../models/MenuItem";
import Outlet from "../../../models/Outlet";
import { createMenuItemSchema, menuQuerySchema } from "../../../lib/validations";
import {
  authenticateRequest,
  authorizeRole,
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
 * GET /api/menu
 * Get menu items with pagination and filtering
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
    const queryValidation = validateQueryParams(req, menuQuerySchema);
    if (!queryValidation.valid) {
      return queryValidation.error;
    }

    const { page, limit, category, outlet } = queryValidation.data;

    // Build query based on user role
    const query = {};

    // Filter by category if provided
    if (category) {
      query.category = category;
    }

    // Outlet-based filtering
    if (auth.user.role === USER_ROLES.ADMIN) {
      // Admins can filter by any outlet or see all
      if (outlet) {
        query.outlet = outlet;
      }
    } else {
      // Managers and employees can only see their outlet's menu items
      if (!auth.user.outlet) {
        return createErrorResponse("User has no outlet assigned", HTTP_STATUS.FORBIDDEN);
      }
      query.outlet = auth.user.outlet;
    }

    // Get total count for pagination
    const total = await MenuItem.countDocuments(query);

    // Fetch menu items with pagination
    const items = await MenuItem.find(query)
      .populate("outlet", "name location")
      .sort({ category: 1, name: 1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    return createResponse({
      items,
      pagination: createPaginationMeta(page, limit, total),
    });
  } catch (error) {
    return handleApiError(error, "GET menu items");
  }
}

/**
 * POST /api/menu
 * Create a new menu item
 * Auth required: Admin, Manager
 * Validates outlet access for managers
 */
export async function POST(req) {
  try {
    // Authenticate request
    const auth = authenticateRequest(req);
    if (!auth.authenticated) {
      return auth.error;
    }

    // Authorize role
    const roleAuth = authorizeRole(auth.user, [USER_ROLES.ADMIN, USER_ROLES.MANAGER]);
    if (!roleAuth.authorized) {
      return roleAuth.error;
    }

    await connectDB();

    // Validate request body
    const validation = await validateRequestBody(req, createMenuItemSchema);
    if (!validation.valid) {
      return validation.error;
    }

    const { name, description, category, price, image, outlet, isAvailable } = validation.data;

    // Authorize outlet access
    const outletAuth = authorizeOutletAccess(auth.user, outlet);
    if (!outletAuth.authorized) {
      return outletAuth.error;
    }

    // Create menu item
    const menuItem = await MenuItem.create({
      name,
      description,
      category,
      price,
      image,
      outlet,
      isAvailable,
    });

    // Populate before returning
    const populatedMenuItem = await MenuItem.findById(menuItem._id)
      .populate("outlet", "name location")
      .lean();

    return createResponse(populatedMenuItem, HTTP_STATUS.CREATED);
  } catch (error) {
    return handleApiError(error, "POST menu item");
  }
}
