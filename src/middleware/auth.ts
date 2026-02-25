import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }
    const token = authHeader.slice(7);
    const payload = await verifyToken(token);
    (req as Request & { user?: object }).user = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};
