import { connectDB } from "../../../../lib/db";
import Outlet from "../../../../models/Outlet";
import User from "../../../../models/User";
import { updateOutletSchema } from "../../../../lib/validations";
import {
  authenticateRequest,
  authorizeRole,
  validateRequestBody,
  createResponse,
  createErrorResponse,
  handleApiError,
} from "../../../../lib/api-helpers";
import { HTTP_STATUS, USER_ROLES } from "../../../../lib/constants";

/**
 * GET /api/outlets/[id]
 * Get a specific outlet by ID
 * Auth required: All roles
 */
export async function GET(req, { params }) {
  try {
    // Authenticate request
    const auth = authenticateRequest(req);
    if (!auth.authenticated) {
      return auth.error;
    }

    await connectDB();
    const { id } = await params;

    const outlet = await Outlet.findById(id)
      .populate("manager", "name email")
      .lean();

    if (!outlet) {
      return createErrorResponse("Outlet not found", HTTP_STATUS.NOT_FOUND);
    }

    return createResponse({ outlet });
  } catch (error) {
    return handleApiError(error, "GET outlet");
  }
}

/**
 * PUT /api/outlets/[id]
 * Update an outlet
 * Auth required: Admin only
 */
export async function PUT(req, { params }) {
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
    const { id } = await params;

    // Validate request body
    const validation = await validateRequestBody(req, updateOutletSchema);
    if (!validation.valid) {
      return validation.error;
    }

    const updateData = validation.data;

    // Find and update outlet
    const outlet = await Outlet.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!outlet) {
      return createErrorResponse("Outlet not found", HTTP_STATUS.NOT_FOUND);
    }

    return createResponse({ outlet });
  } catch (error) {
    return handleApiError(error, "PUT outlet");
  }
}

/**
 * DELETE /api/outlets/[id]
 * Delete (soft delete - mark as inactive) an outlet
 * Auth required: Admin only
 */
export async function DELETE(req, { params }) {
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
    const { id } = await params;

    // Soft delete - mark as inactive
    const outlet = await Outlet.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).lean();

    if (!outlet) {
      return createErrorResponse("Outlet not found", HTTP_STATUS.NOT_FOUND);
    }

    return createResponse({ outlet, message: "Outlet deactivated successfully" });
  } catch (error) {
    return handleApiError(error, "DELETE outlet");
  }
}
