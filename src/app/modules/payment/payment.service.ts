/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from "axios";
import mongoose from "mongoose";
import AppError from "../../errorHandlers/appError";
import { envVars } from "../../config/env";
import { Payment } from "./payment.model";
import { User } from "../user/user.model";
import { IPayment, PaymentStatus, SubscriptionType } from "./payment.interface";
import httpStatus from "http-status-codes";

const generateTransactionId = (): string => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 9);
    return `TXN-${timestamp}-${random}`;
};

const calculateExpiryDate = (subscriptionType: SubscriptionType): Date => {
    const expiryDate = new Date();
    if (subscriptionType === SubscriptionType.MONTHLY) {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else if (subscriptionType === SubscriptionType.YEARLY) {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }
    return expiryDate;
};

const getSubscriptionAmount = (subscriptionType: SubscriptionType): number => {
    const amounts: Record<SubscriptionType, number> = {
        [SubscriptionType.MONTHLY]: Number(envVars.MONTHLY_SUBSCRIPTION_PRICE),
        [SubscriptionType.YEARLY]: Number(envVars.YEARLY_SUBSCRIPTION_PRICE),
    };
    return amounts[subscriptionType];
};

const initPayment = async (
    userId: string,
    subscriptionType: SubscriptionType
): Promise<{ paymentUrl: string; transactionId: string }> => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = await User.findById(userId).session(session);
        if (!user) throw new AppError(404, "User not found");

        // BLOCK IF USER ALREADY HAS ACTIVE PREMIUM
        const now = new Date();
        if (user.subscription?.isPremium && user.subscription?.expiresAt && new Date(user.subscription.expiresAt) > now) {
            throw new AppError(409, "User already has an active subscription");
        }

        if (!Object.values(SubscriptionType).includes(subscriptionType)) {
            throw new AppError(400, "Invalid subscription type");
        }

        const amount = getSubscriptionAmount(subscriptionType);
        const transactionId = generateTransactionId();
        const expiresAt = calculateExpiryDate(subscriptionType);

        await Payment.create([{
            user: userId,
            amount,
            currency: "BDT",
            transactionId,
            paymentStatus: PaymentStatus.PENDING,
            subscriptionType,
            expiresAt,
        }], { session });

        const sslPayload = {
            store_id: envVars.SSL.STORE_ID,
            store_passwd: envVars.SSL.STORE_PASS,
            total_amount: amount,
            currency: "BDT",
            tran_id: transactionId,
            success_url: envVars.SSL.SSL_SUCCESS_FRONTEND_URL,
            fail_url: envVars.SSL.SSL_FAIL_FRONTEND_URL,
            cancel_url: envVars.SSL.SSL_CANCEL_FRONTEND_URL,
            ipn_url: envVars.SSL.SSL_IPN_URL,
            cus_name: user.name,
            cus_email: user.email,
            cus_add1: "N/A",
            shipping_method: "NO",
            product_name: `${subscriptionType.toUpperCase()} Subscription`,
            product_category: "subscription",
            product_profile: "general",
        };

        let response;

        try {
            response = await axios.post(envVars.SSL.SSL_PAYMENT_API, sslPayload, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            });
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            throw new AppError(500, "SSLCommerz payment initialization failed");
        }

        if (response.data?.status !== "SUCCESS" || !response.data?.GatewayPageURL) {
            await session.abortTransaction();
            session.endSession();
            throw new AppError(500, "SSLCommerz failed to generate payment URL");
        }

        await session.commitTransaction();
        session.endSession();

        return {
            paymentUrl: response.data.GatewayPageURL,
            transactionId,
        };

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

const verifyPayment = async (
    transactionId: string,
    sslcommerzData?: Record<string, string>
) => {

    if (!transactionId) throw new AppError(400, "Transaction ID is required");
    if (!sslcommerzData?.val_id) throw new AppError(400, "val_id missing");

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const payment = await Payment.findOne({ transactionId }).session(session);
        if (!payment) throw new AppError(404, "Payment not found");

        // IDEMPOTENCY
        if (payment.paymentStatus === PaymentStatus.SUCCESS) {
            await session.commitTransaction();
            session.endSession();

            return {
                success: true,
                message: "Payment already verified",
                payment,
            };
        }

        const validationParams = {
            val_id: sslcommerzData.val_id,
            store_id: envVars.SSL.STORE_ID,
            store_passwd: envVars.SSL.STORE_PASS,
        };

        let validationResponse;
        try {
            validationResponse = await axios.get(envVars.SSL.SSL_VALIDATION_API, { params: validationParams });
        } catch (err) {
            throw new AppError(500, "Failed to validate payment with SSLCommerz");
        }

        const v = validationResponse.data;

        if (!["VALID", "VALIDATED"].includes(v.status)) {
            payment.paymentStatus = PaymentStatus.FAILED;
            await payment.save({ session });
            await session.commitTransaction();
            session.endSession();

            throw new AppError(402, `Payment failed: ${v.status}`);
        }

        // VERIFY AMOUNT
        if (Number(v.amount) !== payment.amount) {
            throw new AppError(400, "Payment amount mismatch");
        }

        // VERIFY TRANSACTION ID MATCHES
        if (v.tran_id !== transactionId) {
            throw new AppError(400, "Transaction mismatch detected");
        }

        // Update payment record
        payment.paymentStatus = PaymentStatus.SUCCESS;
        payment.paymentGatewayData = v;
        await payment.save({ session });

        // Update user premium
        const user = await User.findById(payment.user).session(session);

        if (!user) {
            throw new AppError(404, "User not found");
        }

        const now = new Date();
        const oldExpiry = user?.subscription?.expiresAt && new Date(user.subscription.expiresAt) > now
            ? new Date(user.subscription.expiresAt)
            : now;

        // Extend expiry
        const newExpiry = new Date(oldExpiry);
        if (payment.subscriptionType === SubscriptionType.MONTHLY) {
            newExpiry.setMonth(newExpiry.getMonth() + 1);
        } else {
            newExpiry.setFullYear(newExpiry.getFullYear() + 1);
        }

        user.subscription = {
            subscriptionId: payment._id.toString(),
            isPremium: true,
            expiresAt: newExpiry,
        };

        await user.save({ session });

        await session.commitTransaction();
        session.endSession();

        return {
            success: true,
            message: "Payment verified successfully",
            payment,
        };

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
};

const handlePaymentCancellation = async (
    transactionId: string
): Promise<{ message: string }> => {
    if (!transactionId || transactionId.trim().length === 0) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Transaction ID is required"
        );
    }

    const payment = await Payment.findOne({ transactionId });
    if (!payment) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            `Payment record not found for transaction ${transactionId}`
        );
    }

    if (payment.paymentStatus === PaymentStatus.PENDING) {
        payment.paymentStatus = PaymentStatus.CANCELED;
        payment.paymentGatewayData = {
            status: "CANCELED",
            timestamp: new Date().toISOString(),
        } as Record<string, string>;
        await payment.save();
    }

    return {
        message: "Payment cancellation recorded successfully",
    };
};

const handlePaymentFailure = async (
    transactionId: string
): Promise<{ message: string }> => {
    if (!transactionId || transactionId.trim().length === 0) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Transaction ID is required"
        );
    }

    const payment = await Payment.findOne({ transactionId });
    if (!payment) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            `Payment record not found for transaction ${transactionId}`
        );
    }

    if (payment.paymentStatus === PaymentStatus.PENDING) {
        payment.paymentStatus = PaymentStatus.FAILED;
        payment.paymentGatewayData = {
            status: "FAILED",
            timestamp: new Date().toISOString(),
        } as Record<string, string>;
        await payment.save();
    }

    return {
        message: "Payment failure recorded successfully",
    };
};

/**
 * HANDLE IPN CALLBACK FROM SSLCOMMERZ
 * This is called in real-time by SSLCommerz when payment status changes
 */
const handleIPNCallback = async (
  ipnData: Record<string, string>
): Promise<{ success: boolean; message: string }> => {
  const transactionId = ipnData.tran_id;
  const status = ipnData.status;

  if (!transactionId || !status) {
    throw new AppError(400, "Invalid IPN data: missing tran_id or status");
  }

  const payment = await Payment.findOne({ transactionId });
  if (!payment) {
    throw new AppError(404, "Payment not found for IPN callback");
  }

  // Only process if payment is still pending
  if (payment.paymentStatus !== PaymentStatus.PENDING) {
    return {
      success: true,
      message: "Payment already processed",
    };
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate payment with SSLCommerz API
    const validationParams = {
      val_id: ipnData.val_id,
      store_id: envVars.SSL.STORE_ID,
      store_passwd: envVars.SSL.STORE_PASS,
    };

    let validationResponse;
    try {
      validationResponse = await axios.get(envVars.SSL.SSL_VALIDATION_API, { params: validationParams });
    } catch (err) {
      throw new AppError(500, "Failed to validate payment with SSLCommerz");
    }

    const v = validationResponse.data;

    if (["VALID", "VALIDATED"].includes(v.status) && Number(v.amount) === payment.amount && v.tran_id === transactionId) {
      // Payment is valid, update as SUCCESS
      payment.paymentStatus = PaymentStatus.SUCCESS;
      payment.paymentGatewayData = v;
      await payment.save({ session });

      // Update user subscription
      const user = await User.findById(payment.user).session(session);
      if (!user) throw new AppError(404, "User not found");

      const now = new Date();
      const oldExpiry = user?.subscription?.expiresAt && new Date(user.subscription.expiresAt) > now
        ? new Date(user.subscription.expiresAt)
        : now;

      const newExpiry = new Date(oldExpiry);
      if (payment.subscriptionType === SubscriptionType.MONTHLY) {
        newExpiry.setMonth(newExpiry.getMonth() + 1);
      } else {
        newExpiry.setFullYear(newExpiry.getFullYear() + 1);
      }

      user.subscription = {
        subscriptionId: payment._id.toString(),
        isPremium: true,
        expiresAt: newExpiry,
      };

      await user.save({ session });

      await session.commitTransaction();
      session.endSession();

      return { success: true, message: "Payment verified and subscription updated" };
    } else {
      // Payment invalid, mark as FAILED
      payment.paymentStatus = PaymentStatus.FAILED;
      payment.paymentGatewayData = v;
      await payment.save({ session });

      await session.commitTransaction();
      session.endSession();

      return { success: false, message: `Payment verification failed: ${v.status}` };
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

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
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        },
    };
};

const getPaymentById = async (paymentId: string): Promise<IPayment> => {
    if (!paymentId || paymentId.trim().length === 0) {
        throw new AppError(httpStatus.BAD_REQUEST, "Payment ID is required");
    }

    const payment = await Payment.findById(paymentId).populate("user");
    if (!payment) {
        throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
    }

    return payment as IPayment;
};

const getPaymentByTransactionId = async (
    transactionId: string
): Promise<IPayment> => {
    if (!transactionId || transactionId.trim().length === 0) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Transaction ID is required"
        );
    }

    const payment = await Payment.findOne({ transactionId }).populate("user");
    if (!payment) {
        throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
    }

    return payment as IPayment;
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

const getSubscriptionDetails = async (
    userId: string
): Promise<{
    hasActiveSubscription: boolean;
    subscription?: {
        subscriptionId?: string;
        isPremium: boolean;
        expiresAt?: Date;
    };
    daysRemaining?: number;
}> => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (!user.subscription || !user.subscription.isPremium) {
        return { hasActiveSubscription: false };
    }

    const now = new Date();
    if (!user.subscription.expiresAt) {
        return { hasActiveSubscription: false };
    }

    const expiryDate = new Date(user.subscription.expiresAt);
    const isActive = now < expiryDate;

    if (!isActive) {
        return { hasActiveSubscription: false };
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
    verifyPayment,
    handlePaymentCancellation,
    handlePaymentFailure,
    handleIPNCallback,
    getPaymentHistory,
    getPaymentById,
    getPaymentByTransactionId,
    checkActiveSubscription,
    getSubscriptionDetails,
};
