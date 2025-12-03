import { Schema, model } from "mongoose";
import { IReview } from "./review.interface";

const ReviewSchema = new Schema<IReview>(
  {
    host: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reviewer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    travelPlan: { type: Schema.Types.ObjectId, ref: "TravelPlan", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
  },
  { timestamps: true }
);

// Index to ensure one review per travel request per reviewer
ReviewSchema.index({ travelPlan: 1, reviewer: 1 }, { unique: true });

// Index for querying reviews by host
ReviewSchema.index({ host: 1 });

// Index for querying reviews by reviewer
ReviewSchema.index({ reviewer: 1 });

export const Review = model<IReview>("Review", ReviewSchema);   