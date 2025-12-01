import z from "zod";

export const createLocationValidation = z.object({
    city : z.string({ error: "City must be string" })
      .min(2, { message: "City is too short" })
      .max(50, { message: "City is too long" }),
    country : z.string({ error: "Country must be string" })
      .min(2, { message: "Country is too short" })
      .max(50, { message: "Country is too long" }), 
    continent : z.string({ error: "Continent must be string" })
      .min(2, { message: "Continent is too short" })
      .max(50, { message: "Continent is too long" })
})