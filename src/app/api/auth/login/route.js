import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import { comparePassword, generateToken } from "../../../../lib/auth";
import { loginSchema } from "../../../../lib/validations";
import {
  validateRequestBody,
  createResponse,
  createErrorResponse,
  handleApiError,
} from "../../../../lib/api-helpers";
import { HTTP_STATUS, ERROR_MESSAGES } from "../../../../lib/constants";
import { checkRateLimit } from "../../../../lib/rate-limit";

export async function POST(req) {
  try {
    // Apply rate limiting to prevent brute force attacks
    const rateLimit = checkRateLimit(req);
    if (!rateLimit.allowed) {
      return createErrorResponse(
        ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
        HTTP_STATUS.TOO_MANY_REQUESTS
      );
    }

    await connectDB();

    // Validate request body
    const validation = await validateRequestBody(req, loginSchema);
    if (!validation.valid) {
      return validation.error;
    }

    const { email, password } = validation.data;

    // Find user by email and explicitly select password field
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return createErrorResponse(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return createErrorResponse(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }

    // Check if user is active
    if (!user.isActive) {
      return createErrorResponse("Account is deactivated", HTTP_STATUS.FORBIDDEN);
    }

    // Generate JWT token (include outlet in token)
    const token = generateToken(user._id.toString(), user.role, user.outlet?.toString());

    return createResponse({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        outlet: user.outlet || null,
      },
    }, HTTP_STATUS.OK);
  } catch (error) {
    return handleApiError(error, "Login");
  }
}
