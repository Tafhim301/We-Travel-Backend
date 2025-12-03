import { Types } from "mongoose";

export interface IReview {
  host: Types.ObjectId;
  reviewer: Types.ObjectId;
  rating: number;
  comment: string;
  travelPlan: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
