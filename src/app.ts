// importing packages and modules
import express, { type Express } from "express";
import cookieParser from "cookie-parser";

// importing routers
import authRouter from "./modules/auth/auth.routes.js";
import postRouter from "./modules/post/post.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import userRouter from "./modules/users/user.routes.js";

const app: Express = express();

// middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routers
app.use(authRouter);
app.use(postRouter);
app.use(userRouter);

// centralized error handler
app.use(errorHandler);

export default app;
