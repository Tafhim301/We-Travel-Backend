import { Schema, model } from "mongoose";
import { IInterest } from "./interests.interface";

const InterestSchema = new Schema<IInterest>(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export const Interest = model<IInterest>("Interest", InterestSchema);
