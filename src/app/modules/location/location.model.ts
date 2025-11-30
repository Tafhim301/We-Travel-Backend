import { Schema, model } from "mongoose";
import { ILocation } from "./location.interface";

const LocationSchema = new Schema<ILocation>(
  {
    country: { type: String, required: true },
    city: { type: String, required: true },
    continent: { type: String },
  },
  { timestamps: true }
);

export const Location = model<ILocation>("Location", LocationSchema);
