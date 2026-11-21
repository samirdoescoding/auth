import { Router } from "express";
import * as taskControllers from "./task.controllers.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const taskRouter: Router = Router();

/**
 * POST /tasks 
 */
taskRouter.post(
  "/tasks",
  authenticate,
  taskControllers.createTask
);
/**
 * GET /tasks
 */
taskRouter.get(
  "/tasks",
  authenticate,
  taskControllers.getTasks
);
/**
 * GET /tasks/:id
 */
taskRouter.get(
  "/tasks/:id",
  authenticate,
  taskControllers.getTask
);

export default taskRouter;