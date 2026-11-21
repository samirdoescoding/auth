import z from "zod";
import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../modules/auth/auth.service.js";

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

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        message: "Access token required"
      });
    }

    const token = authHeader?.split(" ")[2];

    const decoded = verifyAccessToken(token);

    req.user = decoded;

    next();

  } catch (error) {
    res.status(401).json({
      message: error.message
    })
  }
}
