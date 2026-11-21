// importing packages and modules
import express, { type Express } from "express";
import cookieParser from "cookie-parser";

// importing routers
import authRouter from "./modules/auth/auth.route.js";
import taskRouter from "./modules/task/task.routes.js";

const app: Express = express();

//middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routers
app.use(authRouter);
app.use(taskRouter);

export default app;
