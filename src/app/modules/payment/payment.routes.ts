import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { paymentControllers } from "./payment.controller";
import { Role } from "../user/user.interface";

const router = Router();


router.post("/webhook", paymentControllers.stripeWebhook);


router.post(
    "/init",
    checkAuth(Role.USER),
    paymentControllers.initPayment
);

router.get("/success", paymentControllers.paymentSuccess);
router.get("/fail", paymentControllers.paymentFail);
router.get("/cancel", paymentControllers.paymentCancel);

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

router.get(
    "/transaction/:transactionId",
    checkAuth(Role.USER),
    paymentControllers.getPaymentByTransactionId
);

router.get(
    "/:paymentId",
    checkAuth(Role.USER),
    paymentControllers.getPaymentById
);

export const paymentRoutes = router;
