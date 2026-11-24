import { Router } from "express";
import * as postControllers from "./post.controllers.js";
import { authenticate, validateBody } from "../../middlewares/auth.middleware.js";
import { createPostSchema } from "./post.validators.js";

const postRouter: Router = Router();

/**
 * POST /posts 
 */
postRouter.post(
  "/posts",
  authenticate,
  validateBody(createPostSchema),
  postControllers.createPost
);

/**
 * GET /posts
 */
postRouter.get(
  "/posts",
  authenticate,
  postControllers.getPosts
);

/**
 * GET /posts/:id
 */
postRouter.get(
  "/posts/:id",
  authenticate,
  postControllers.getPost
);

/**
 * PATCH /posts/:id
 */
postRouter.patch(
  "/posts/:id",
  authenticate,
  postControllers.updatePost
);

/**
 * DELETE /posts/:id
 */
postRouter.delete(
  "/posts/:id",
  authenticate,
  postControllers.deletePost
);

export default postRouter;