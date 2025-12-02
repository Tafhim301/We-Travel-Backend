import { Schema, model, Types } from "mongoose";
import { ITravelPlan, TravelType } from "./travelPlan.interface";

const TravelPlanSchema = new Schema<ITravelPlan>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true }, 
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    demoImages: { type: [String], default: [] },
    destination: { type: Schema.Types.ObjectId, ref: "Location", required: true }, 
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    budgetRange: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    travelType: {
      type: String,
      enum: Object.values(TravelType),
      required: true,
    },
    itinerary: { type: String, required: true },
    visibility: { type: Boolean, default: true },
    requestedBy: [{ type: Types.ObjectId, ref: "User" }],
    approvedMembers: [{ type: Types.ObjectId, ref: "User" }],
 
    maxMembers: { type: Number, default: 10 }, 
  },
  { timestamps: true }
);

export const TravelPlan = model<ITravelPlan>("TravelPlan", TravelPlanSchema);
