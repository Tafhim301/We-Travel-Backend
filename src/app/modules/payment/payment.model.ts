import { Schema, model } from "mongoose";
import { IPayment, PaymentStatus, SubscriptionType } from "./payment.interface";

const PaymentSchema = new Schema<IPayment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "BDT" },
    transactionId: { type: String, required: true, unique: true },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    paymentGatewayData: {
      tran_id: { type: String },
      status: { type: String },
      val_id: { type: String },
      bank_tran_id: { type: String },
      card_type: { type: String },
      card_no: { type: String },
      card_issuer: { type: String },
    },
    subscriptionType: {
      type: String,
      enum: Object.values(SubscriptionType),
      required: true,
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Index for fast user lookups
PaymentSchema.index({ user: 1 });



// Index for status queries
PaymentSchema.index({ paymentStatus: 1 });

// Compound index for user and payment status
PaymentSchema.index({ user: 1, paymentStatus: 1 });

export const Payment = model<IPayment>("Payment", PaymentSchema);
