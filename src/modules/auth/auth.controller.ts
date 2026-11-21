import type { Request, RequestHandler, Response } from "express";
import userModel from "../users/user.model.js";
import sessionModel from "../session/session.model.js";
import {
  generatePasswordHash,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  generateRefreshTokenHash,
  verifyRefreshToken,
} from "./auth.service.js";
import { refreshTokenCookieOptions } from "../../utils/cookies.js";
import { sevenDays } from "../../const/token-const.js";

export const register = async (req: Request, res: Response) => {
  try {
    // 1. Reading the name, email and password from body
    const { name, email, password } = req.body;

    // 2. Checking if the user already exists,
    // if exists show that user already exists
    const user = await userModel.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: "User already exists!",
      });
    }

    // 3. Hash the password and save user in database
    const hashPassword = await generatePasswordHash(password);
    await userModel.create({
      name: name,
      email,
      password: hashPassword,
    });

    // 4. Send success message
    return res.status(201).json({
      message: "User was successfully registered",
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      message: "Server error!",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    // 1. Reading email and password
    const { email, password } = req.body;

    // 2. Finding user
    // if user does not exists tell the user
    // do not let the user know which one is wrong email or password
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // 3. Checking password
    const isPasswordCorrect = verifyPassword(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // 4. Generating access token and refresh token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 5. Refresh token is hashed and stored in session
    const refreshTokenHash = generateRefreshTokenHash(refreshToken);

    // 6. Creating a new user session
    await sessionModel.create({
      user: user._id,
      refreshTokenHash,
      expiresAt: new Date(Date.now() + sevenDays),
      userAgent: req.get("user-agent") ?? null,
      ip: req.ip ?? null,
    });

    // 7. Refresh token is stored in client's httpOnly cookie
    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

    // 8. access token goes to the client as a response
    // and stored in memory
    return res.status(201).json({
      accessToken,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      message: "Server error!",
    });
  }
};

export const meController = async (req: Request, res: Response) => {
  try {
    // 1. Reading authenticated user
    const authenticatedUser = req.user;
    if (!authenticatedUser) {
      return res.status(401).json({
        message: "Authentication required!",
      });
    }

    // 2. Finding user info by user id
    const id = authenticatedUser.userId;

    const user = await userModel.findById(id);
    if (!user) {
      return res.status(401).json({
        message: "User not found!",
      });
    }

    // 3. Sending user's info to the user
    return res.status(201).json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error!",
    });
  }
};

export const refreshTokenController = async (req: Request, res: Response) => {
  try {
    // 1. get refresh token from cookie
    const oldRefreshToken = req.cookies?.refreshToken;
    if (!oldRefreshToken) {
      return res.status(401).json({
        message: "Refresh token required",
      });
    }

    // 2. verify refresh token
    const { userId } = verifyRefreshToken(oldRefreshToken);

    // 3. hash it
    const oldHashedRefreshToken = generateRefreshTokenHash(oldRefreshToken);

    // 4. find the matching session
    // and making sure that the session is not revoked
    // and not expired
    const session = await sessionModel.findOne({
      user: userId,
      refreshTokenHash: oldHashedRefreshToken,
    });

    if (!session) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    if (session.revokedAt) {
      return res.status(401).json({
        message: "Refresh token has been revoked",
      });
    }

    if (session.expiresAt < new Date()) {
      return res.status(401).json({
        message: "Expired refresh token",
      });
    }

    // 5. find the user
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(401).json({
        message: "User no longer exists",
      });
    }

    // 6. revoke the old session
    session.revokedAt = new Date();
    await session.save();

    // 7. generating new tokens
    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // 8. hashing the new refresh token
    const newHashedRefreshToken = generateRefreshTokenHash(newRefreshToken);

    // 9. creating a new session
    await sessionModel.create({
      user: userId,
      refreshTokenHash: newHashedRefreshToken,
      expiresAt: new Date(Date.now() + sevenDays),
    });

    // 10. saving refresh token in cookie
    res.cookie("refreshToken", newRefreshToken, refreshTokenCookieOptions);

    // 11. sending the access token as response
    return res.status(201).json({
      accessToken,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error!",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // 1. get the refresh token
    const refreshToken = req.cookies.refreshToken;

    // 2. find the session and revoke
    if (refreshToken) {
      const hashedRefreshedToken = generateRefreshTokenHash(refreshToken);
      await sessionModel.findOneAndUpdate(
        {
          refreshTokenHash: hashedRefreshedToken,
          revokedAt: null,
        },
        { revokedAt: new Date() },
      );

      res.clearCookie("refreshToken");

      return res.json({
        message: "Logout was successful",
      });
    } else {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      message: "Server error!",
    });
  }
};

export const logoutAll = async (req: Request, res: Response) => {
  try {
    // If no access token, fail the request
    if (!req.user) {
      return res.status(403).json({
        message: "Unauthorized!",
      });
    }

    const userId = req.user.userId;

    // Revoke all sessions
    await sessionModel.updateMany(
      { user: userId, revokedAt: null },
      { revokedAt: new Date() },
    );

    res.clearCookie("refreshToken");

    return res.status(201).json({
      message: "Logged out from all devices",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error!",
    });
  }
};
