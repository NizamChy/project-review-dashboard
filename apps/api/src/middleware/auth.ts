import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

export type AuthUser = { id: string; email: string; role: Role; name: string };
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token)
    return res.status(401).json({ message: "Authentication required." });
  const secret = process.env.JWT_SECRET;
  if (!secret)
    return res
      .status(500)
      .json({ message: "Server authentication is not configured." });
  try {
    const payload = jwt.verify(token, secret) as AuthUser;
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({
      message: "Your session is invalid or expired. Please log in again.",
    });
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user)
      return res.status(401).json({ message: "Authentication required." });
    if (!roles.includes(req.user.role))
      return res.status(403).json({
        message: "You do not have permission to perform this action.",
      });
    next();
  };
}
