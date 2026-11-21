import type { Request, Response } from "express";
import { refreshTokenCookieOptions } from "../../utils/cookies.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  verifyRefreshToken,
} from "./auth.service.js";
import userModel from "../users/user.model.js";
import { checkPassword, generatePasswordHash } from "./auth.service.js";
import sessionModel, { Session } from "../session/session.model.js";
import { sevenDays } from "../../const/token-const.js";

export const register = async (req: Request, res: Response) => {
  // deconstructing name, email and password
  const { name, email, password } = req.body;

  try {
    // checking if user already exists
    const user = await userModel.findOne({ email });
    if (user) {
      throw new Error("User already exists");
    }

    // saving the user in database
    const hashPassword = await generatePasswordHash(password);
    const newUser = await userModel.create({
      name: name,
      email,
      password: hashPassword,
    });

    res.status(201).json({
      message: "User was successfully registered",
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    // deconstruct email and password
    const { email, password } = req.body;

    // finding user
    const user = await userModel.findOne({ email });
    if (!user) {
      throw new Error("Invalid email or password");
    }
    // checking password
    const isPasswordCorrect = checkPassword(password, user.password);
    if (!isPasswordCorrect) {
      throw new Error("Invalid email or password");
    }
    // generating access token and refresh token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // refresh token is hashed and stored in session
    const refreshTokenHash = hashRefreshToken(refreshToken);
    // creating a new user session
    await sessionModel.create({
      user: user._id,
      refreshTokenHash,
      expiresAt: new Date(Date.now() + sevenDays),
      userAgent: req.get("user-agent") ?? null,
      ip: req.ip ?? null,
    });
    // refresh token is stored in client's httpOnly cookie
    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

    // access token goes to the client as a response
    // and stored in memory
    res.status(201).json({ accessToken });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const meController = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    res.status(401).json({
      message: "Authentication required",
    });
  }

  const id = user._id;
  const { name, email, role } = await userModel.findOne({ id });

  res.status(201).json({
    success: true,
    user: {
      name,
      email,
      role,
    },
  });
};

export const refreshTokenController = async (req: Request, res: Response) => {
  try {
    // 1. get refresh token from cookie
    const oldRefreshToken = req.cookies.refreshToken;
    if (!oldRefreshToken) {
      res.status(401).json({
        message: "Refresh token required",
      });
    }

    // 2. verify refresh token
    const { userId } = verifyRefreshToken(oldRefreshToken);

    // 3. hash it
    const oldHashedRefreshToken = hashRefreshToken(oldRefreshToken);

    // 4. find the matching session
    // and making sure that the session is not revoked
    // and not expired
    const session: Session = await sessionModel.findOne({
      user: userId,
      refreshTokenHash: oldHashedRefreshToken,
    });

    if (!session) {
      res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    if (session.revokedAt) {
      res.status(401).json({
        message: "Refresh token has been revoked",
      });
    }

    if (session.expiresAt < new Date()) {
      res.status(401).json({
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
    const newHashedRefreshToken = hashRefreshToken(newRefreshToken);

    // 9. creating a new session
    await sessionModel.create({
      user: userId,
      refreshTokenHash: newHashedRefreshToken,
      expiresAt: new Date(Date.now() + sevenDays),
    });

    // 10. saving refresh token in cookie
    res.cookie("refreshToken", newRefreshToken, refreshTokenCookieOptions);

    // 11. sending the access token as response
    res.status(201).json({
      accessToken,
    });
  } catch (error) {
    res.status(401).json({
      message: "Invalid or Expired Refresh Token",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // 1. get the refresh token
    const refreshToken = req.cookies.refreshToken;

    // 2. find the session and revoke
    if (refreshToken) {
      const hashedRefreshedToken = hashRefreshToken(refreshToken);
      await sessionModel.findOneAndUpdate(
        {
          refreshTokenHash: hashedRefreshedToken,
          revokedAt: null,
        },
        { revokedAt: new Date() },
      );

      res.clearCookie("refreshToken");

      res.json({
        message: "Logout was successful",
      });
    } else {
      res.status(401).json({
        message: "Invalid refresh token",
      });
    }
  } catch (error) {
    res.status(401).json({
      message: error.message,
    });
  }
};

export const logoutAll = async (req: Request, res: Response) => {
  try {
    // 1. Revoke all sessions
    await sessionModel.updateMany(
      { user: req.user.userId, revokedAt: null },
      { revokedAt: new Date() }
    );

    res.clearCookie("refreshToken");

    res.status(201).json({
      message: "Logged out from all devices"
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error!",
    });
  }
};
