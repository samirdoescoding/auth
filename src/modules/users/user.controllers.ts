import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import userModel from "./user.model.js";
import { AppError } from "../../utils/AppError.js";
import mongoose from "mongoose";

// GET all users
export const getAllUsers = asyncHandler(
  async (_req: Request, res: Response) => {
    
    // Find users other than admin
    const users = await userModel.find({
      role: "user"
    });
    // if no users found
    if (!users) {
      throw new AppError(404, "No users found");
    }

    return res.status(201).json({ users });
  },
);

// GET all admins
export const getAllAdmins = asyncHandler(
  async (_req: Request, res: Response) => {
    
    // Find users other than admin
    const admin = await userModel.find({
      role: "admin"
    });
    // if no users found
    if (!admin) {
      throw new AppError(404, "No admins found");
    }

    return res.status(201).json({ admin });
  },
);

// DELETE a user
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.id;
  if (!userId || !mongoose.isValidObjectId(userId)) {
    throw new AppError(400, "Invalid user id");
  }

  const user = await userModel.findOne({
    _id: userId,
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (user.role === "admin") {
    throw new AppError(403, "Admin can not be deleted");
  }

  await userModel.deleteOne({
    _id: userId,
  });

  return res.status(201).json({
    success: true,
    message: "User was successfully deleted.",
  });
});

// DELETE all users
export const deleteUsers = asyncHandler(
  async (_req: Request, res: Response) => {
    await userModel.deleteMany({
      role: "user",
    });

    return res.status(201).json({
      success: true,
      message: "All users were successfully deleted.",
    });
  },
);
