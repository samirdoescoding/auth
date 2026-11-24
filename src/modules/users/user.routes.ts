import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import * as userControllers from "./user.controllers.js";

const userRouter: Router = Router();

/**
 * GET /users
 */
userRouter.get(
  "/users",
  authenticate,
  authorize("admin"),
  userControllers.getAllUsers,
);

/**
 * GET /users/admin
 */
userRouter.get(
  "/users/admin",
  authenticate,
  authorize("admin"),
  userControllers.getAllAdmins,
);

/**
 * DELETE /users
 */
userRouter.delete(
  "/users/:id",
  authenticate,
  authorize("admin"),
  userControllers.deleteUser,
);

/**
 * DELETE /users
 */
userRouter.delete(
  "/users",
  authenticate,
  authorize("admin"),
  userControllers.deleteUsers,
);

export default userRouter;
