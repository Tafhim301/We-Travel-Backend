import { Types } from "mongoose";

export enum TravelType {
  SOLO = "solo",
  FAMILY = "family",
  FRIENDS = "friends",
}

export interface ITravelPlan {
  user: Types.ObjectId;  
  destination: string;
  startDate: Date;
  endDate: Date;
  budgetRange: {
    min: number;
    max: number;
  };
  travelType: TravelType;
  itinerary: string;
  visibility: boolean;

  members: Types.ObjectId[];   
  maxMembers: number;          
  requestedBy: Types.ObjectId[];  
}
