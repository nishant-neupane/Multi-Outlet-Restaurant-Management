import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import { hashPassword, generateToken } from "../../../../lib/auth";
import { signupSchema } from "../../../../lib/validations";
import {
  validateRequestBody,
  createResponse,
  createErrorResponse,
  handleApiError,
} from "../../../../lib/api-helpers";
import { HTTP_STATUS, ERROR_MESSAGES, USER_ROLES } from "../../../../lib/constants";
import { checkRateLimit } from "../../../../lib/rate-limit";

export async function POST(req) {
  try {
    // Apply rate limiting to prevent spam signups
    const rateLimit = checkRateLimit(req, {
      max: 3, // Allow only 3 signup attempts per window
    });
    if (!rateLimit.allowed) {
      return createErrorResponse(
        ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
        HTTP_STATUS.TOO_MANY_REQUESTS
      );
    }

    await connectDB();

    // Validate request body
    const validation = await validateRequestBody(req, signupSchema);
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

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || USER_ROLES.EMPLOYEE,
      outlet: outlet || null,
    });

    // Generate JWT token
    const token = generateToken(user._id.toString(), user.role, user.outlet?.toString());

    return createResponse(
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          outlet: user.outlet,
        },
      },
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    return handleApiError(error, "User registration");
  }
}
