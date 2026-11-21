import { Router } from "express";
import * as authControllers from "./auth.controller.js";
import { authenticate, validateBody } from "../../middlewares/auth.middleware.js";
import { loginSchema, registerSchema } from "./auth.validation.js";

const authRouter: Router = Router();

/**
 * /register
 */
authRouter.post(
  "/register",
  validateBody(registerSchema),
  authControllers.register
);
/**
 * /login
 */
authRouter.post(
  "/login", 
  validateBody(loginSchema), 
  authControllers.login
);
/**
 * /me
 */
authRouter.get(
  "/me",
  authenticate,
  authControllers.meController
);
/**
 * /refresh
 */
authRouter.post(
  "/refresh",
  authControllers.refreshTokenController
)
/**
 * /logout
 */
authRouter.post(
  "/logout",
  authControllers.logout
)
/**
 * /logout-all
 */
authRouter.post(
  "/logout-all",
  authenticate,
  authControllers.logoutAll
)
export default authRouter;