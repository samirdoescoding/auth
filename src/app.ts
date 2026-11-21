import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import authRouter from "./modules/auth/auth.route.js";

const app: Express = express();

//middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routers
app.use(authRouter);

export default app;
