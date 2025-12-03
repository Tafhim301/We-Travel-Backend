import { Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";
import { paymentServices } from "./payment.service";
import { SubscriptionType } from "./payment.interface";
import httpStatus from "http-status-codes";


export const initPayment = catchAsync(async (req: Request, res: Response) => {
    const userId = (req.user as { userId: string })?.userId;
    const { subscriptionType } = req.body;


    if (
        !subscriptionType ||
        !Object.values(SubscriptionType).includes(subscriptionType)
    ) {
        sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: "Invalid subscription type. Must be 'monthly' or 'yearly'",
            data: null,
        });
        return;
    }

    const result = await paymentServices.initPayment(userId, subscriptionType);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Payment session initialized. Redirecting to payment gateway...",
        data: result,
    });
});

/**
 * VERIFY PAYMENT
 * POST /api/payments/verify
 * Body: { transactionId: string, val_id?: string }
 * This is called after user completes payment on SSLCommerz
 */
export const verifyPayment = catchAsync(async (req: Request, res: Response) => {
    const { transactionId, val_id } = req.body;

    const result = await paymentServices.verifyPayment(transactionId, {
        val_id: val_id || "",
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: result.success,
        message: result.message,
        data: result.payment,
    });
});

/**
 * PAYMENT SUCCESS CALLBACK
 * GET /api/payments/success
 * Query: transactionId, val_id, etc. (sent by SSLCommerz)
 * This endpoint handles SSLCommerz success callback
 */
export const paymentSuccess = catchAsync(
    async (req: Request, res: Response) => {
        const { transactionId, val_id } = req.query;

        // Verify payment with SSLCommerz
        const result = await paymentServices.verifyPayment(
            transactionId as string,
            {
                val_id: (val_id as string) || "",
            }
        );

        if (result.success) {
            // Redirect to frontend success page with transaction ID
            const redirectUrl = `${process.env.SSL_SUCCESS_FRONTEND_URL}?transactionId=${transactionId}&status=success`;
            res.redirect(redirectUrl);
        } else {
            const redirectUrl = `${process.env.SSL_FAIL_FRONTEND_URL}?transactionId=${transactionId}&status=failed`;
            res.redirect(redirectUrl);
        }
    }
);


export const paymentFail = catchAsync(async (req: Request, res: Response) => {
    const { transactionId } = req.query;

    await paymentServices.handlePaymentFailure(transactionId as string);


    const redirectUrl = `${process.env.SSL_FAIL_FRONTEND_URL}?transactionId=${transactionId}&status=failed`;
    res.redirect(redirectUrl);
});


export const paymentCancel = catchAsync(
    async (req: Request, res: Response) => {
        const { transactionId } = req.query;

        await paymentServices.handlePaymentCancellation(transactionId as string);

        // Redirect to frontend cancel page
        const redirectUrl = `${process.env.SSL_CANCEL_FRONTEND_URL}?transactionId=${transactionId}&status=cancelled`;
        res.redirect(redirectUrl);
    }
);


export const getPaymentHistory = catchAsync(
    async (req: Request, res: Response) => {
        const userId = (req.user as { userId: string })?.userId;
        const page = req.query.page ? Number(req.query.page) : 1;
        const limit = req.query.limit ? Number(req.query.limit) : 10;

        const result = await paymentServices.getPaymentHistory(
            userId,
            page,
            limit
        );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Payment history retrieved successfully",
            meta: {
                total: result.pagination.total,
            },
            data: result.data,
        });
    }
);

/**
 * GET PAYMENT BY ID
 * GET /api/payments/:paymentId
 * Auth: Optional (can be public or protected)
 */
export const getPaymentById = catchAsync(async (req: Request, res: Response) => {
    const { paymentId } = req.params;

    const result = await paymentServices.getPaymentById(paymentId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Payment retrieved successfully",
        data: result,
    });
});

/**
 * GET PAYMENT BY TRANSACTION ID
 * GET /api/payments/transaction/:transactionId
 * Auth: Optional
 */
export const getPaymentByTransactionId = catchAsync(
    async (req: Request, res: Response) => {
        const { transactionId } = req.params;

        const result = await paymentServices.getPaymentByTransactionId(
            transactionId
        );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Payment retrieved successfully",
            data: result,
        });
    }
);

/**
 * CHECK ACTIVE SUBSCRIPTION
 * GET /api/payments/subscription/status
 * Auth: Required (check if current user has active subscription)
 * Returns: { hasActiveSubscription: boolean }
 */
export const checkSubscriptionStatus = catchAsync(
    async (req: Request, res: Response) => {
        const userId = (req.user as { userId: string })?.userId;

        const isActive = await paymentServices.checkActiveSubscription(userId);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Subscription status retrieved successfully",
            data: { hasActiveSubscription: isActive },
        });
    }
);

/**
 * GET SUBSCRIPTION DETAILS
 * GET /api/payments/subscription/details
 * Auth: Required (get subscription details for current user)
 * Returns: { hasActiveSubscription, subscription, daysRemaining }
 */
export const getSubscriptionDetails = catchAsync(
    async (req: Request, res: Response) => {
        const userId = (req.user as { userId: string })?.userId;

        const result = await paymentServices.getSubscriptionDetails(userId);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Subscription details retrieved successfully",
            data: result,
        });
    }
);

/**
 * HANDLE IPN CALLBACK FROM SSLCOMMERZ
 * POST /api/payments/ipn
 * This is called by SSLCommerz in real-time when payment status changes
 */
export const handleIPN = catchAsync(async (req: Request, res: Response) => {
    const ipnData = req.body;

    await paymentServices.handleIPNCallback(ipnData);

    // SSLCommerz expects a plain text response
    res.status(httpStatus.OK).send("Success");
});

export const paymentControllers = {
    initPayment,
    verifyPayment,
    paymentSuccess,
    paymentFail,
    paymentCancel,
    handleIPN,
    getPaymentHistory,
    getPaymentById,
    getPaymentByTransactionId,
    checkSubscriptionStatus,
    getSubscriptionDetails,
};
