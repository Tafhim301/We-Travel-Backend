import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { statsControllers } from "./stats.controller";
import { Role } from "../user/user.interface";

const router = Router();

/**
 * ADMIN ROUTES
 */
router.get("/admin/dashboard", checkAuth(Role.ADMIN), statsControllers.getAdminDashboard);
router.get("/admin/overview", checkAuth(Role.ADMIN), statsControllers.getAdminOverview);
router.get("/admin/payments", checkAuth(Role.ADMIN), statsControllers.getPaymentAnalytics);
router.get("/admin/travel-plans", checkAuth(Role.ADMIN), statsControllers.getTravelPlanAnalytics);
router.get("/admin/travel-requests", checkAuth(Role.ADMIN), statsControllers.getTravelRequestAnalytics);
router.get("/admin/reviews", checkAuth(Role.ADMIN), statsControllers.getReviewAnalytics);
router.get("/admin/user-growth", checkAuth(Role.ADMIN), statsControllers.getUserGrowthAnalytics);
router.get("/admin/top-hosts", checkAuth(Role.ADMIN), statsControllers.getTopReviewedHosts);
router.get("/admin/top-destinations", checkAuth(Role.ADMIN), statsControllers.getTopDestinations);

/**
 * USER ROUTES
 */
router.get("/me/dashboard", checkAuth(Role.USER), statsControllers.getUserDashboard);

export const statsRoutes = router;
