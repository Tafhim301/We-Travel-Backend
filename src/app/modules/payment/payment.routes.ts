import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { paymentControllers } from "./payment.controller";
import { Role } from "../user/user.interface";

const router = Router();

// IPN Callback - MUST be before other routes (real-time payment updates)
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

// Verify Payment
router.post(
    "/verify",
    paymentControllers.verifyPayment
);

// Payment History (Protected)
router.get(
    "/history",
    checkAuth(Role.USER),
    paymentControllers.getPaymentHistory
);

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

// Get Payment by Transaction ID
router.get(
    "/transaction/:transactionId",
    paymentControllers.getPaymentByTransactionId
);

export const paymentRoutes = router;