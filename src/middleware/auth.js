import { verifyToken } from "../lib/auth";
import { NextResponse } from "next/server";

export function withAuth(handler) {
  return async (req) => {
    const token = req.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    req.user = decoded;
    return handler(req);
  };
}

export function withRole(...roles) {
  return (handler) => {
    return async (req) => {
      const token = req.headers.get("authorization")?.split(" ")[1];

      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const decoded = verifyToken(token);
      if (!decoded || !roles.includes(decoded.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      req.user = decoded;
      return handler(req);
    };
  };
}
