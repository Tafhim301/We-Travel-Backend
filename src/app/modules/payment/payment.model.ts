import { model, Schema } from "mongoose";
import { IPayment, PAYMENT_STATUS, SUBSCRIPTION_TYPE } from "./payment.interface";

const paymentSchema = new Schema<IPayment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "BDT",
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.UNPAID,
    },
    paymentGatewayData: {
      type: Schema.Types.Mixed,
    },
    subscriptionType: {
      type: String,
      enum: Object.values(SUBSCRIPTION_TYPE),
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes for performance
paymentSchema.index({ user: 1 });
paymentSchema.index({ paymentStatus: 1 });
paymentSchema.index({ user: 1, paymentStatus: 1 });

export const Payment = model<IPayment>("Payment", paymentSchema);
