import { Schema, model } from "mongoose";
import { isActive, IUser, Role } from "./user.interface";

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.USER,
    },

   profileImage: {
  url: { type: String, default: "" },
  public_id: { type: String, default: "" },
  },

    bio: { type: String, default: "" },

    interests: { type: [Schema.Types.ObjectId], default: [], ref: "Interest"},

    visitedCountries: { type: [String], default: [] },

    currentLocation: { type: String, default: "" },

    isActive: { type: String, enum: Object.values(isActive), default: isActive.ACTIVE },


    plans: [{ type: Schema.Types.ObjectId, ref: "TravelPlan" , default: [] }],

    reviewsReceived: [{ type: Schema.Types.ObjectId, ref: "Review" , default: [] }],

    reviewsWritten: [{ type: Schema.Types.ObjectId, ref: "Review" , default: [] }],

    averageRating: { type: Number, default: 0, min: 0, max: 5 },

    totalReviewsReceived: { type: Number, default: 0, min: 0 },


    subscription: {
      subscriptionId : {type : Schema.Types.ObjectId, ref : "Subscription", default: null},
      isPremium: { type: Boolean, default: false },
      expiresAt: { type: Date, default: null },
    },
  },
  {
    timestamps: true, 
    versionKey: false,
  }
);

export const User = model<IUser>("User", UserSchema);
