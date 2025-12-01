import z from "zod";

export const createInterestValidation = z.object({
  name: z
    .string({ error: "Interest name must be string" })
    .min(2, { message: "Interest name is too short" })
    .max(50, { message: "Interest name is too long" }),
})