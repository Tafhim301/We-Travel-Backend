import { Schema, model } from "mongoose";
import { IPayment, PaymentStatus, SubscriptionType } from "./payment.interface";

const PaymentSchema = new Schema<IPayment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    transactionId: { type: String, required: true, unique: true },
    paymentStatus: {
      type: String,
      enum: PaymentStatus,
      default: PaymentStatus.PENDING,
    },
    subscriptionType: {
      type: String,
      enum: SubscriptionType,
      required: true,
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Payment = model<IPayment>("Payment", PaymentSchema);
