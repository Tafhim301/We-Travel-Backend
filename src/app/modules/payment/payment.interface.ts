/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from "mongoose";

export enum PAYMENT_STATUS {
  PAID = "PAID",
  UNPAID = "UNPAID",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
  
}

export enum SUBSCRIPTION_TYPE {
  MONTHLY = "monthly",
  YEARLY = "yearly",
}

export interface IPayment {
  user: Types.ObjectId;
  amount: number;
  currency: string;
  transactionId: string;
  paymentStatus: PAYMENT_STATUS;
  paymentGatewayData?: any;
  subscriptionType: SUBSCRIPTION_TYPE;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
