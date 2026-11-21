import z from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters"),
  email: z
    .email("Please provide a valid email address")
    .trim()
    .max(254, "Email can not exceed 254 characters")
    .transform((email) => email.toLowerCase()),
  password: z
    .string()
    .min(8, "Password must contain at least 8 characters")
    .max(128, "Password can not exceed 128 characters`")
});

export const loginSchema = z.object({
  email: z
    .email("Please provide a valid email address")
    .trim()
    .max(254, "Email can not exceed 254 characters")
    .transform((email) => email.toLowerCase()),
  password: z
    .string()
    .min(8, "Password must contain at least 8 characters")
    .max(128, "Password can not exceed 128 characters`")
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;


