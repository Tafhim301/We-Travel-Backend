import { Types } from "mongoose";

export enum TravelRequestStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

export interface ITravelRequest {
  travelPlan: Types.ObjectId;
  requester: Types.ObjectId;
  host: Types.ObjectId;
  status: TravelRequestStatus;
  message?: string;
}
