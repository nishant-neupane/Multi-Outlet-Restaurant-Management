import { NextResponse } from "next/server";
import { verifyToken } from "./auth";
import { HTTP_STATUS, ERROR_MESSAGES, USER_ROLES } from "./constants";
import { checkRateLimit } from "./rate-limit";

/**
 * Create a standardized JSON response
 */
export function createResponse(data, status = HTTP_STATUS.OK) {
  return NextResponse.json(data, { status });
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(message, status = HTTP_STATUS.BAD_REQUEST, errors = null) {
  const response = { error: message };
  if (errors) {
    response.errors = errors;
  }
  return NextResponse.json(response, { status });
}

/**
 * Verify authentication token from request
 * Returns { authenticated: boolean, user: object | null, error: Response | null }
 */
export function authenticateRequest(request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      authenticated: false,
      user: null,
      error: createErrorResponse(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED),
    };
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return {
      authenticated: false,
      user: null,
      error: createErrorResponse(ERROR_MESSAGES.INVALID_TOKEN, HTTP_STATUS.UNAUTHORIZED),
    };
  }

  return {
    authenticated: true,
    user: decoded,
    error: null,
  };
}

/**
 * Check if user has required role
 * Returns { authorized: boolean, error: Response | null }
 */
export function authorizeRole(user, allowedRoles = []) {
  if (!allowedRoles.includes(user.role)) {
    return {
      authorized: false,
      error: createErrorResponse(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN),
    };
  }

  return {
    authorized: true,
    error: null,
  };
}

/**
 * Check if user can access outlet data
 * Admins can access all outlets, managers/employees only their own
 */
export function authorizeOutletAccess(user, outletId) {
  // Admins can access all outlets
  if (user.role === USER_ROLES.ADMIN) {
    return {
      authorized: true,
      error: null,
    };
  }

  // Managers and employees must have an outlet assigned
  if (!user.outlet) {
    return {
      authorized: false,
      error: createErrorResponse("User has no outlet assigned", HTTP_STATUS.FORBIDDEN),
    };
  }

  // Check if user's outlet matches the requested outlet
  if (user.outlet.toString() !== outletId.toString()) {
    return {
      authorized: false,
      error: createErrorResponse(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN),
    };
  }

  return {
    authorized: true,
    error: null,
  };
}

/**
 * Validate request body against schema
 * Returns { valid: boolean, data: object | null, error: Response | null }
 */
export async function validateRequestBody(request, schema) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      }));

      return {
        valid: false,
        data: null,
        error: createErrorResponse(ERROR_MESSAGES.INVALID_INPUT, HTTP_STATUS.BAD_REQUEST, errors),
      };
    }

    return {
      valid: true,
      data: result.data,
      error: null,
    };
  } catch (error) {
    return {
      valid: false,
      data: null,
      error: createErrorResponse("Invalid JSON", HTTP_STATUS.BAD_REQUEST),
    };
  }
}

/**
 * Validate query parameters against schema
 */
export function validateQueryParams(request, schema) {
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());

  const result = schema.safeParse(params);

  if (!result.success) {
    const errors = result.error.errors.map((err) => ({
      path: err.path.join("."),
      message: err.message,
    }));

    return {
      valid: false,
      data: null,
      error: createErrorResponse(ERROR_MESSAGES.INVALID_INPUT, HTTP_STATUS.BAD_REQUEST, errors),
    };
  }

  return {
    valid: true,
    data: result.data,
    error: null,
  };
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error, context = "API operation") {
  console.error(`${context} error:`, error);

  // MongoDB duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return createErrorResponse(
      `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
      HTTP_STATUS.CONFLICT
    );
  }

  // MongoDB validation error
  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map((err) => ({
      path: err.path,
      message: err.message,
    }));
    return createErrorResponse(ERROR_MESSAGES.INVALID_INPUT, HTTP_STATUS.BAD_REQUEST, errors);
  }

  // MongoDB cast error (invalid ObjectId)
  if (error.name === "CastError") {
    return createErrorResponse("Invalid ID format", HTTP_STATUS.BAD_REQUEST);
  }

  // Default error
  return createErrorResponse(ERROR_MESSAGES.SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
}

/**
 * Create pagination metadata
 */
export function createPaginationMeta(page, limit, total) {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
