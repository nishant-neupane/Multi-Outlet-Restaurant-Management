import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Validate JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  throw new Error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");
}

const JWT_SECRET = process.env.JWT_SECRET;

export function generateToken(userId, role, outlet = null) {
  const payload = { userId, role };
  if (outlet) {
    payload.outlet = outlet;
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    // Log failed verification attempts for security monitoring
    if (process.env.NODE_ENV === "production") {
      console.error("Token verification failed:", error.message);
    }
    return null;
  }
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}
