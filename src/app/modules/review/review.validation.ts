import z from "zod";

 export const createReviewValidation = z.object({
  
     host: z.string().regex(/^[0-9a-f]{24}$/i, 'Invalid host ID'),
     travelPlan: z.string().regex(/^[0-9a-f]{24}$/i, 'Invalid travel plan ID'),
     rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
     comment: z
        .string()
         .min(5, 'Comment must be at least 5 characters')
         .max(1000, 'Comment cannot exceed 1000 characters'),

 });