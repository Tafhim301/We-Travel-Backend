
import z from "zod";
import { Role, isActive } from "./user.interface";

export const createUserZodSchema = z.object(
  {
  body : z.object({
    name: z
    .string()
    .min(2, { message: "Name is too short" })
    .max(50, { message: "Name is too long" }),

  email: z.string().email({ message: "Invalid email address" }),

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

  role: z.enum(Object.values(Role) as [string, ...string[]]).optional(),

profileImage: z
  .object({
    url: z.string().url(),
    public_id: z.string(),
  })
  .optional(),

  bio: z.string().max(200).optional(),

  interests: z.array(z.string()).optional(),

  visitedCountries: z.array(z.string()).optional(),

  currentLocation: z.string().optional(),

  isActive: z.enum(Object.values(isActive) as [string, ...string[]]).optional(),
  })
});


export const updateUserZodSchema = z.object({
  body : z.object({
   name: z.string().min(2).max(50).optional(),

  email: z.string().email({ message: "Invalid email address" }).optional(),

  role: z.enum(Object.values(Role) as [string, ...string[]]).optional(),

  profileImage: z.file().optional(),

  bio: z.string().max(200).optional(),

  interests: z.array(z.string()).optional(),

  visitedCountries: z.array(z.string()).optional(),

  currentLocation: z.string().optional(),

  isActive: z.enum(Object.values(isActive) as [string, ...string[]]).optional(),
  })

});

export const changePasswordZodSchema = z.object({
  oldPassword: z.string({ error: "Old password is required" }),
  newPassword: z
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
});

