import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import env from "../../config/env.js";
import crypto from "crypto";

// password related functions
export const generatePasswordHash = async (password: string) => {
  return await bcrypt.hash(password, 12);
};

export const checkPassword = async (
  inputPassword: string,
  realPassword: string,
) => {
  return await bcrypt.compare(inputPassword, realPassword);
};

// token related functions
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

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, env.ACCESS_TOKEN_SECRET);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET);
};

export const hashRefreshToken = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};