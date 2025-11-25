import jwt from "jsonwebtoken";
import type { AdminUser } from "@shared/schema";

const JWT_SECRET = process.env.SESSION_SECRET || "lunaveil-jwt-secret-change-in-production";
const JWT_EXPIRY = "24h";

export interface JWTPayload {
  id: string;
  username: string;
  role: string;
}

export function generateToken(user: Omit<AdminUser, "password" | "googleEmail">): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    } as JWTPayload,
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
}
