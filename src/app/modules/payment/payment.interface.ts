import { Types } from "mongoose";

export enum PaymentStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
  CANCELLED = "cancelled",
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
  paymentGatewayData?: {
    tran_id?: string;
    status?: string;
    val_id?: string;
    bank_tran_id?: string;
    card_type?: string;
    card_no?: string;
    card_issuer?: string;
  };
  subscriptionType: SubscriptionType;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
