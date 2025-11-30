import { Schema, model } from "mongoose";
import { ITravelRequest, TravelRequestStatus } from "./travelRequest.interface";

const TravelRequestSchema = new Schema<ITravelRequest>(
  {
    travelPlan: { type: Schema.Types.ObjectId, ref: "TravelPlan", required: true },
    requester: { type: Schema.Types.ObjectId, ref: "User", required: true },
    host: { type: Schema.Types.ObjectId, ref: "User", required: true }, 

    status: {
      type: String,
      enum: TravelRequestStatus,
      default: TravelRequestStatus.PENDING,
    },
    message: { type: String },
  },
  { timestamps: true }
);

export const TravelRequest = model<ITravelRequest>("TravelRequest", TravelRequestSchema);
