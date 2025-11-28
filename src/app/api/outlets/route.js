import { connectDB } from "../../../lib/db";
import Outlet from "../../../models/Outlet";
import { createOutletSchema } from "../../../lib/validations";
import {
  authenticateRequest,
  authorizeRole,
  validateRequestBody,
  createResponse,
  handleApiError,
} from "../../../lib/api-helpers";
import { HTTP_STATUS, USER_ROLES } from "../../../lib/constants";

/**
 * GET /api/outlets
 * Get all active outlets
 * Public endpoint - needed for signup page to select outlet
 */
export async function GET(req) {
  try {
    await connectDB();

    const outlets = await Outlet.find({ isActive: true })
      .select("name location address phone totalTables theme isActive")
      .sort({ name: 1 })
      .lean();

    return createResponse({ outlets });
  } catch (error) {
    return handleApiError(error, "GET outlets");
  }
}

/**
 * POST /api/outlets
 * Create a new outlet (admin only)
 * Auth required: Admin
 * Validates input
 */
export async function POST(req) {
  try {
    // Authenticate request
    const auth = authenticateRequest(req);
    if (!auth.authenticated) {
      return auth.error;
    }

    // Authorize role (admin only)
    const roleAuth = authorizeRole(auth.user, [USER_ROLES.ADMIN]);
    if (!roleAuth.authorized) {
      return roleAuth.error;
    }

    await connectDB();

    // Validate request body
    const validation = await validateRequestBody(req, createOutletSchema);
    if (!validation.valid) {
      return validation.error;
    }

    const { name, location, address, phone, totalTables, manager, theme, isActive } = validation.data;

    // Create outlet
    const outlet = await Outlet.create({
      name,
      location,
      address,
      phone,
      totalTables,
      manager,
      theme: theme || "blue",
      isActive,
    });

    return createResponse({ outlet }, HTTP_STATUS.CREATED);
  } catch (error) {
    return handleApiError(error, "POST outlet");
  }
}
