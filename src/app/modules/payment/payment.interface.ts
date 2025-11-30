import { Types } from "mongoose";

export enum PaymentStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
}

export enum SubscriptionType { 
  MONTHLY = "monthly",
  YEARLY = "yearly",
}

export interface IPayment {
  user: Types.ObjectId;
  amount: number;
  currency: string;
  transactionId: string;
  paymentStatus: PaymentStatus;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  paymentGatewayData ?: any;
  subscriptionType: SubscriptionType;
  expiresAt: Date;
}
