import { Types } from "mongoose";

export enum TravelRequestStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

export interface ITravelRequest {
  travelPlan: Types.ObjectId;
  requester: Types.ObjectId;
  host: Types.ObjectId;
  status: TravelRequestStatus;
  message?: string;
}
