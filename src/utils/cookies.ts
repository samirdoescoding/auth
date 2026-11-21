import env from "../config/env.js";
import { CookieOptions } from "express";
import { sevenDays } from "../const/token-const.js";

export const refreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: sevenDays
}