import { connectDB } from "../../../lib/db";
import User from "../../../models/User";
import Outlet from "../../../models/Outlet";
import { hashPassword } from "../../../lib/auth";
import { createUserSchema } from "../../../lib/validations";
import {
  authenticateRequest,
  authorizeRole,
  validateRequestBody,
  createResponse,
  createErrorResponse,
  handleApiError,
} from "../../../lib/api-helpers";
import { HTTP_STATUS, ERROR_MESSAGES, USER_ROLES } from "../../../lib/constants";

/**
 * GET /api/users
 * Get all users (admin only)
 * Auth required: Admin
 * Excludes password field for security
 */
export async function GET(req) {
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

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const outlet = searchParams.get("outlet");

    const query = {};
    if (role) query.role = role;
    if (outlet) query.outlet = outlet;

    // Explicitly exclude password field for security
    const users = await User.find(query)
      .select("-password")
      .populate("outlet", "name location")
      .sort({ createdAt: -1 })
      .lean();

    return createResponse({ users });
  } catch (error) {
    return handleApiError(error, "GET users");
  }
}

/**
 * POST /api/users
 * Create a new user (admin only)
 * Auth required: Admin
 * Validates input and hashes password
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
    const validation = await validateRequestBody(req, createUserSchema);
    if (!validation.valid) {
      return validation.error;
    }

    const { name, email, password, role, outlet } = validation.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return createErrorResponse(ERROR_MESSAGES.EMAIL_EXISTS, HTTP_STATUS.CONFLICT);
    }

    // Validate outlet requirement for non-admin users
    if (role !== USER_ROLES.ADMIN && !outlet) {
      return createErrorResponse(ERROR_MESSAGES.OUTLET_REQUIRED, HTTP_STATUS.BAD_REQUEST);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      outlet: role !== USER_ROLES.ADMIN ? outlet : null,
    });

    // Return user without password
    const userResponse = await User.findById(user._id)
      .select("-password")
      .populate("outlet", "name location")
      .lean();

    return createResponse(userResponse, HTTP_STATUS.CREATED);
  } catch (error) {
    return handleApiError(error, "POST user");
  }
}
