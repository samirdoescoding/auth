import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import env from "../../config/env.js";
import crypto from "crypto";
import { JWTAccessPayload, JwtRefreshPayload } from "./auth.types.js";

// password related functions
export const generatePasswordHash = async (password: string) => {
  return await bcrypt.hash(password, 12);
};

export const verifyPassword = async (
  inputPassword: string,
  realPassword: string,
) => {
  return await bcrypt.compare(inputPassword, realPassword);
};

// access token and refresh token related functions
export const generateAccessToken = (user: any) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    },
  );
};

export const generateRefreshToken = (user: any) => {
  return jwt.sign(
    {
      userId: user._id,
    },
    env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    },
  );
};

export const generateRefreshTokenHash = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const verifyAccessToken = (token: string): JWTAccessPayload => {
  const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET);

  if (
    typeof decoded === "string" ||
    typeof decoded.userId !== "string" ||
    (decoded.role !== "user" && decoded.role !== "admin")
  ) {
    throw new Error("Invalid access token")
  }

  return {
    userId: decoded.userId,
    role: decoded.role
  };
};

export const verifyRefreshToken = (token: string): JwtRefreshPayload => {
  const decoded = jwt.verify(token, env.REFRESH_TOKEN_SECRET);

  if (
    typeof decoded === "string" ||
    typeof decoded.userId !== "string"
  ) {
    throw new Error("Invalid access token payload");
  }

  return {
    userId: decoded.userId,
  };
};
