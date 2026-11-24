import z from "zod";
import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../modules/auth/auth.services.js";
import { UserRole } from "../modules/users/user.model.js";

// Verifying the Body
export const validateBody = (schema: z.ZodType) => {
  return (
    req: Request, 
    res: Response, 
    next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: result.error.issues[0]?.message,
      });
    }

    req.body = result.data;

    next();
  };
};

// Verifying Access Token
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Getting the Access token
    const authHeader = req.headers.authorization;

    // 2. Checking if the user has access token or 
    // the token is invalid
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access token required"
      });
    }

    // 3. Splitting the access token from "Bearer " 
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        message: "Invalid authorization header",
      });
    }

    // 4. Decoding the access token
    const decoded = verifyAccessToken(token);

    // 5. Passing the payload to the controllers
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };

    next();

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error!"
    })
  }
}

// Verifying Role
export const authorize = (...allowedRoles: UserRole[]) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const user = req.user;
    if (!user) {
      return res.status(403).json({
        message: "Unauthorized!"
      });
    }

    const role = user.role;
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        message: "Forbidden!"
      })
    }

    return next();
  }
}
