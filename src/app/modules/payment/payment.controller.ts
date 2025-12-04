/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";
import { paymentServices } from "./payment.service";
import httpStatus from "http-status-codes";
import { envVars } from "../../config/env";

const stripe = new Stripe(envVars.STRIPE_SECRET_KEY);

export const initPayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as { userId: string })?.userId;
    const { subscriptionType } = req.body;

    const result = await paymentServices.initPayment(userId, subscriptionType);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Payment session initialized. Redirecting to payment gateway...",
        data: result,
    });
});

export const paymentSuccess = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Stripe redirects to success_url with session_id
    const query = req.query as Record<string, string>;
    const sessionId = query.session_id as string | undefined;
    const transactionIdFromQuery = query.transactionId as string | undefined;

    let transactionId = transactionIdFromQuery || "";

    if (sessionId) {
        // retrieve session to get metadata and confirm payment
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session && (session.metadata as any)?.transactionId) {
            transactionId = (session.metadata as any).transactionId as string;
        }

        // Call service to mark success using metadata
        await paymentServices.successPayment({ transactionId, session_id: sessionId, status: "completed" });
    } else {
        // fallback: call service with query
        await paymentServices.successPayment(query as Record<string, string>);
    }

    const redirectUrl = `${envVars.FRONTEND_URL}/payment/success?transactionId=${transactionId}&status=success`;
    res.redirect(redirectUrl);
});

export const paymentFail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as Record<string, string>;
    const transactionId = query.transactionId as string | undefined;

    await paymentServices.failPayment(query as Record<string, string>);

    const redirectUrl = `${envVars.FRONTEND_URL}/payment/fail?transactionId=${transactionId || ""}&status=failed`;
    res.redirect(redirectUrl);
});

export const paymentCancel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as Record<string, string>;
    const transactionId = query.transactionId as string | undefined;

    await paymentServices.cancelPayment(query as Record<string, string>);

    const redirectUrl = `${envVars.FRONTEND_URL}/payment/cancel?transactionId=${transactionId || ""}&status=cancelled`;
    res.redirect(redirectUrl);
});

export const stripeWebhook = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const sig = (req.headers["stripe-signature"] as string) || "";
    const rawBody = (req as any).rawBody as Buffer | undefined;

    if (!rawBody) {
        res.status(400).send("Missing raw body for webhook");
        return;
    }

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(rawBody, sig, envVars.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Handle the event
    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const metadata = session.metadata || {};
            const transactionId = (metadata as any).transactionId as string | undefined;

            await paymentServices.successPayment({ transactionId: transactionId || "", session_id: session.id, status: "completed" });
            break;
        }
        case "checkout.session.async_payment_failed":
        case "payment_intent.payment_failed": {
            const obj = event.data.object as any;
            const metadata = obj.metadata || {};
            const transactionId = metadata.transactionId as string | undefined;

            await paymentServices.failPayment({ transactionId: transactionId || "" });
            break;
        }
        default:
            // Other event types are acknowledged
            break;
    }

    res.json({ received: true });
});

export const getPaymentHistory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as { userId: string })?.userId;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await paymentServices.getPaymentHistory(userId, page, limit);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Payment history retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});

export const getPaymentById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { paymentId } = req.params;

    const result = await paymentServices.getPaymentById(paymentId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Payment retrieved successfully",
        data: result,
    });
});

export const getPaymentByTransactionId = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { transactionId } = req.params;

    const result = await paymentServices.getPaymentByTransactionId(transactionId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Payment retrieved successfully",
        data: result,
    });
});

export const checkSubscriptionStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as { userId: string })?.userId;

    const isActive = await paymentServices.checkActiveSubscription(userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Subscription status retrieved successfully",
        data: { hasActiveSubscription: isActive },
    });
});

export const getSubscriptionDetails = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as { userId: string })?.userId;

    const result = await paymentServices.getSubscriptionDetails(userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Subscription details retrieved successfully",
        data: result,
    });
});

export const paymentControllers = {
    initPayment,
    paymentSuccess,
    paymentFail,
    paymentCancel,
    stripeWebhook,
    getPaymentHistory,
    getPaymentById,
    getPaymentByTransactionId,
    checkSubscriptionStatus,
    getSubscriptionDetails,
};
