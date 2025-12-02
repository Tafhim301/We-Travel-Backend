import z from "zod";
import { TravelType } from "./travelPlan.interface";

export const createTravelPlanSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    destination: z.string(),
    startDate: z.string().transform((v) => new Date(v)),
    endDate: z.string().transform((v) => new Date(v)),
    itinerary: z.string(),
    travelType: z.enum(Object.values(TravelType) as [string, ...string[]]),
    visibility: z.boolean().optional(),
    maxMembers: z.number().optional(),

    budgetRange: z.object({
      min: z.number(),
      max: z.number(),
    }),
  }),
});
export const updateTravelPlanSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(), 
    description: z.string().min(10).optional(),
    destination: z.string().optional(),
    startDate: z.string().transform((v) => new Date(v)).optional(),
    endDate: z.string().transform((v) => new Date(v)).optional(),
    itinerary: z.string().optional(),
    travelType: z.enum(Object.values(TravelType) as [string, ...string[]]).optional(),
    visibility: z.boolean().optional(),
    removeImages: z.array(z.string()).optional(),
    budgetRange: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
    }).optional(),
  }).optional(),
});                       