/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Stripe from "stripe";
import mongoose from "mongoose";
import httpStatus from "http-status-codes";
import AppError from "../../errorHandlers/appError";
import { envVars } from "../../config/env";
import { Payment } from "./payment.model";
import { User } from "../user/user.model";
import { IPayment, PAYMENT_STATUS, SUBSCRIPTION_TYPE } from "./payment.interface";

const stripe = new Stripe(envVars.STRIPE_SECRET_KEY);

const generateTransactionId = (): string => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 9).toUpperCase();
    return `TXN-${timestamp}-${random}`;
};


const calculateExpiryDate = (subscriptionType: SUBSCRIPTION_TYPE): Date => {
    const expiryDate = new Date();
    if (subscriptionType === SUBSCRIPTION_TYPE.MONTHLY) {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else if (subscriptionType === SUBSCRIPTION_TYPE.YEARLY) {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }
    return expiryDate;
};


const getSubscriptionAmount = (subscriptionType: SUBSCRIPTION_TYPE): number => {
    const amounts: Record<SUBSCRIPTION_TYPE, number> = {
        [SUBSCRIPTION_TYPE.MONTHLY]: Number(envVars.MONTHLY_SUBSCRIPTION_PRICE),
        [SUBSCRIPTION_TYPE.YEARLY]: Number(envVars.YEARLY_SUBSCRIPTION_PRICE),
    };
    return amounts[subscriptionType];
};


const initPayment = async (
    userId: string,
    subscriptionType: SUBSCRIPTION_TYPE
): Promise<{ paymentUrl: string; transactionId: string }> => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Validate user exists
        const user = await User.findById(userId).session(session);
        if (!user) {
            throw new AppError(httpStatus.NOT_FOUND, "User not found");
        }

        // Check if user already has active subscription
        const now = new Date();
        if (
            user.subscription?.isPremium &&
            user.subscription?.expiresAt &&
            new Date(user.subscription.expiresAt) > now
        ) {
            throw new AppError(
                httpStatus.CONFLICT,
                "User already has an active subscription"
            );
        }

        // Validate subscription type
        if (!Object.values(SUBSCRIPTION_TYPE).includes(subscriptionType)) {
            throw new AppError(httpStatus.BAD_REQUEST, "Invalid subscription type");
        }

        const amount = getSubscriptionAmount(subscriptionType);
        const transactionId = generateTransactionId();
        const expiresAt = calculateExpiryDate(subscriptionType);

        // Create payment record in UNPAID status
        await Payment.create(
            [
                {
                    user: userId,
                    amount,
                    currency: "BDT",
                    transactionId,
                    paymentStatus: PAYMENT_STATUS.UNPAID,
                    subscriptionType,
                    expiresAt,
                },
            ],
            { session }
        );

        // Create Stripe Checkout Session for one-time subscription payment
        try {
            const stripeSession = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                mode: "payment",
                line_items: [
                    {
                        price_data: {
                            currency: "bdt",
                            product_data: {
                                name: `${subscriptionType.toUpperCase()} Subscription`,
                            },
                            unit_amount: Math.round(amount * 100),
                        },
                        quantity: 1,
                    },
                ],
                success_url: `${envVars.BACKEND_URL}/api/v1/payment/success?transactionId=${transactionId}&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${envVars.BACKEND_URL}/api/v1/payment/cancel?transactionId=${transactionId}`,
                metadata: {
                    userId: userId,
                    subscriptionType: subscriptionType,
                    transactionId,
                },
            });

            await session.commitTransaction();
            session.endSession();

            return {
                paymentUrl: stripeSession.url as string,
                transactionId,
            };
        } catch (error: any) {
            await Payment.deleteOne({ transactionId }, { session });
            await session.abortTransaction();
            session.endSession();
            throw new AppError(
                httpStatus.INTERNAL_SERVER_ERROR,
                `Failed to initialize payment with Stripe: ${error?.message || error}`
            );
        }
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};


const successPayment = async (
    query: Record<string, string>
): Promise<{ success: boolean; message: string }> => {
    const transactionId = query.transactionId || query.tran_id;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const payment = await Payment.findOne({ transactionId }).session(session);

        if (payment && payment.paymentStatus !== PAYMENT_STATUS.PAID) {
            await Payment.updateOne(
                { transactionId },
                { $set: { paymentStatus: PAYMENT_STATUS.PAID, paymentGatewayData: query } },
                { session, runValidators: true }
            );

            const user = await User.findById(payment.user).session(session);
            if (user) {
                const now = new Date();
                const oldExpiry =
                    user?.subscription?.expiresAt && new Date(user.subscription.expiresAt) > now
                        ? new Date(user.subscription.expiresAt)
                        : now;

                const newExpiry = new Date(oldExpiry);
                if (payment.subscriptionType === SUBSCRIPTION_TYPE.MONTHLY) {
                    newExpiry.setMonth(newExpiry.getMonth() + 1);
                } else {
                    newExpiry.setFullYear(newExpiry.getFullYear() + 1);
                }

                const subscriptionObj = {
                    subscriptionId: payment._id.toString(),
                    isPremium: true,
                    expiresAt: newExpiry,
                };

                await User.updateOne({ _id: user._id }, { $set: { subscription: subscriptionObj } }, { session, runValidators: true });
            }
        }

        await session.commitTransaction();
        session.endSession();

        return {
            success: true,
            message: payment ? "Payment completed successfully and subscription activated" : "No matching payment found; nothing to update",
        };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

const failPayment = async (
    query: Record<string, string>
): Promise<{ success: boolean; message: string }> => {
    const transactionId = query.transactionId || query.tran_id;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const payment = await Payment.findOne({ transactionId }).session(session);

        if (payment && payment.paymentStatus === PAYMENT_STATUS.UNPAID) {
            await Payment.updateOne(
                { transactionId },
                { $set: { paymentStatus: PAYMENT_STATUS.FAILED, paymentGatewayData: query } },
                { session, runValidators: true }
            );
        }

        await session.commitTransaction();
        session.endSession();

        return {
            success: false,
            message: payment ? "Payment failed" : "No matching payment found; nothing to update",
        };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};


const cancelPayment = async (
    query: Record<string, string>
): Promise<{ success: boolean; message: string }> => {
    const transactionId = query.transactionId || query.tran_id;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const payment = await Payment.findOne({ transactionId }).session(session);


        if (payment && payment.paymentStatus === PAYMENT_STATUS.UNPAID) {
            await Payment.updateOne(
                { transactionId },
                { $set: { paymentStatus: PAYMENT_STATUS.CANCELLED, paymentGatewayData: query } },
                { session, runValidators: true }
            );
        }

        await session.commitTransaction();
        session.endSession();

        return {
            success: true,
            message: payment ? "Payment cancelled" : "No matching payment found; nothing to update",
        };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};


const validatePayment = async (
    ipnData: Record<string, string>
): Promise<{ success: boolean; message: string }> => {

    const transactionId = ipnData.tran_id || ipnData.transactionId;
    const status = ipnData.status || "";

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const payment = await Payment.findOne({ transactionId }).session(session);

        // If payment not found, do not throw; just return informative result
        if (!payment) {
            await session.commitTransaction();
            session.endSession();
            return { success: false, message: "No matching payment found; nothing to update" };
        }

   
        if (payment.paymentStatus !== PAYMENT_STATUS.UNPAID) {
            await session.commitTransaction();
            session.endSession();
            return {
                success: true,
                message: "Payment already processed",
            };
        }

        if (status === "VALID" || status === "VALIDATED") {
            // Payment is valid, update to PAID
            await Payment.updateOne(
                { transactionId },
                { $set: { paymentStatus: PAYMENT_STATUS.PAID, paymentGatewayData: ipnData } },
                { session, runValidators: true }
            );

            // Update user subscription
            const user = await User.findById(payment.user).session(session);
            if (user) {
                const now = new Date();
                const oldExpiry =
                    user?.subscription?.expiresAt && new Date(user.subscription.expiresAt) > now
                        ? new Date(user.subscription.expiresAt)
                        : now;

                const newExpiry = new Date(oldExpiry);
                if (payment.subscriptionType === SUBSCRIPTION_TYPE.MONTHLY) {
                    newExpiry.setMonth(newExpiry.getMonth() + 1);
                } else {
                    newExpiry.setFullYear(newExpiry.getFullYear() + 1);
                }

                const subscriptionObj = {
                    subscriptionId: payment._id.toString(),
                    isPremium: true,
                    expiresAt: newExpiry,
                };

                await User.updateOne({ _id: user._id }, { $set: { subscription: subscriptionObj } }, { session, runValidators: true });
            }

            await session.commitTransaction();
            session.endSession();

            return {
                success: true,
                message: "Payment verified and subscription activated",
            };
        } else {
            // Payment failed
            await Payment.updateOne(
                { transactionId },
                { $set: { paymentStatus: PAYMENT_STATUS.FAILED, paymentGatewayData: ipnData } },
                { session, runValidators: true }
            );

            await session.commitTransaction();
            session.endSession();

            return {
                success: false,
                message: `Payment failed: ${status}`,
            };
        }
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

/**
 * Get payment history for a user
 */
const getPaymentHistory = async (
    userId: string,
    page = 1,
    limit = 10
) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
        Payment.find({ user: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Payment.countDocuments({ user: userId }),
    ]);

    return {
        data: payments,
        meta: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        },
    };
};

/**
 * Get payment by ID
 */
const getPaymentById = async (paymentId: string) => {
    if (!paymentId || paymentId.trim().length === 0) {
        throw new AppError(httpStatus.BAD_REQUEST, "Payment ID is required");
    }

    const payment = await Payment.findById(paymentId).populate("user");
    if (!payment) {
        throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
    }

    return payment;
};

/**
 * Get payment by transaction ID
 */
const getPaymentByTransactionId = async (
    transactionId: string
) => {
    const payment = await Payment.findOne({ transactionId }).populate("user");
    if (!payment) {
        throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
    }

    return payment;
};


const checkActiveSubscription = async (userId: string): Promise<boolean> => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (
        !user.subscription ||
        !user.subscription.isPremium ||
        !user.subscription.expiresAt
    ) {
        return false;
    }

    return new Date() < new Date(user.subscription.expiresAt);
};

const getSubscriptionDetails = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (!user.subscription || !user.subscription.isPremium) {
        return {
            hasActiveSubscription: false,
        };
    }

    const now = new Date();
    if (!user.subscription.expiresAt) {
        return {
            hasActiveSubscription: false,
        };
    }

    const expiryDate = new Date(user.subscription.expiresAt);
    const isActive = now < expiryDate;

    if (!isActive) {
        return {
            hasActiveSubscription: false,
        };
    }

    const daysRemaining = Math.ceil(
        (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
        hasActiveSubscription: true,
        subscription: user.subscription,
        daysRemaining,
    };
};

export const paymentServices = {
    initPayment,
    successPayment,
    failPayment,
    cancelPayment,
    validatePayment,
    getPaymentHistory,
    getPaymentById,
    getPaymentByTransactionId,
    checkActiveSubscription,
    getSubscriptionDetails,
};
