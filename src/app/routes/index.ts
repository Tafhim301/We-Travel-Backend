import { Router } from "express";
import { userRoutes } from "../modules/user/user.routes";
import { authRoutes } from "../modules/auth/auth.routes";
import { travelRequestRoutes } from "../modules/travelRequest/travelRequest.routes";
import { locationRoutes } from "../modules/location/location.routes";
import { paymentRoutes } from "../modules/payment/payment.routes";
import { reviewRoutes } from "../modules/review/review.routes";
import { travelPlanRoutes } from "../modules/TravelPlan/travelPlan.routes";


export const router = Router();

const moduleRoutes = [
    {
       path : '/user',
       route : userRoutes
    },
    {
       path : '/auth',
       route : authRoutes
    },
    {
         path : '/travel-requests',
         route : travelRequestRoutes
      
    },
    {
         path : '/location',
         route : locationRoutes
    },
    {
         path : '/payment',
         route : paymentRoutes
    },
    {
         path : '/review',
         route : reviewRoutes
    },
    {
         path : '/travel-plans',
         route : travelPlanRoutes
    }
    
    
];


moduleRoutes.forEach((route) => {
    router.use(route.path,route.route)
})
