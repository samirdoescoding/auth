import { UserRole } from "../users/user.model.js";

export interface RegisterUser {
  name: string;
  email: string;
  password: string;
}

export interface LoginUser {
  email: string,
  password: string
}

// JWT related types
export interface JWTAccessPayload {
  userId: string;
  role: UserRole;
}

export interface JwtRefreshPayload {
  userId: string;
}