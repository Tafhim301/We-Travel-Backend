import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { paymentControllers } from "./payment.controller";
import { Role } from "../user/user.interface";

const router = Router();

router.post(
    "/ipn",
    paymentControllers.handleIPN
);

// Initialize Payment
router.post(
    "/init",
    checkAuth(Role.USER),
    paymentControllers.initPayment
);


router.post(
    "/validate-payment",
    paymentControllers.verifyPayment
);

// Payment History (Protected)
router.get(
    "/history",
    checkAuth(Role.USER),
    paymentControllers.getPaymentHistory
);

// Subscription Endpoints (Protected) - MUST be before generic /:paymentId
router.get(
    "/subscription/status",
    checkAuth(Role.USER),
    paymentControllers.checkSubscriptionStatus
);

router.get(
    "/subscription/details",
    checkAuth(Role.USER),
    paymentControllers.getSubscriptionDetails
);


router.post(
    "/success",
    paymentControllers.paymentSuccess
);

router.post(
    "/fail",
    paymentControllers.paymentFail
);

router.post(
    "/cancel",
    paymentControllers.paymentCancel
);

// Get Payment by ID (Generic - MUST be after specific routes)
router.get(
    "/:paymentId",
    paymentControllers.getPaymentById
);


router.get(
    "/transaction/:transactionId",
    paymentControllers.getPaymentByTransactionId
);

export const paymentRoutes = router;