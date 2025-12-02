import { Types } from "mongoose";

export enum TravelType {
  SOLO = "SOLO",
  FAMILY = "FAMILY",
  FRIENDS = "FRIENDS",
  COUPLE = "COUPLE",
  BUSINESS = "BUSINESS",
  ADVENTURE = "ADVENTURE",
  LEISURE = "LEISURE",
  EXCURSION = "EXCURSION",
}

export interface ITravelPlan {
  user: Types.ObjectId; 
  title: string;
  description: string;
  image : string; 
  demoImages : string[];
  destination: Types.ObjectId;
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
  approvedMembers: Types.ObjectId[];  
}
