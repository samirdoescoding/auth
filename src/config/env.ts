import z from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .string()
    .min(1, "NODE_ENV is missing"),
  MONGODB_URI: z
    .string()
    .min(1, "MONGODB_URI is missing"),
  PORT: z
    .coerce
    .number()
    .int()
    .min(4)
    .default(8080),
  ACCESS_TOKEN_SECRET: z
    .string()
    .min(1, "ACCESS_TOKEN_SECRET is missing"),
  REFRESH_TOKEN_SECRET: z
    .string()
    .min(1, "REFRESH_TOKEN_SECRET is missing"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables");
  console.error(parsedEnv.error);
  process.exit(1);
}

const env = parsedEnv.data;
export default env;
