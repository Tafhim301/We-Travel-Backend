import z from "zod";

export const createUserZodSchema = z.object({
  name: z
    .string({ error: "Name must be string" })
    .min(2, { message: "Name is too short" })
    .max(50, { message: "Name is too long" }),
  email: z.email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .refine((val) => /[A-Z]/.test(val), {
      message: "Password must contain at least one uppercase letter",
    })
    .refine((val) => /[^a-zA-Z0-9]/.test(val), {
      message: "Password must contain at least one special character",
    })
    .refine((val) => /\d/.test(val), {
      message: "Password must contain at least one number",
    }),

  role: z.string().optional()


});
export const updateUserZodSchema = z.object({
  name: z
    .string({ error: "Name must be string" })
    .min(2, { message: "Name is too short" })
    .max(50, { message: "Name is too long" })
    .optional(),
  email: z.email({ message: "Invalid email address" }).optional(),
  password: z.string().optional()




});
