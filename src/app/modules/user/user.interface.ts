import { Types } from "mongoose";


export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
  
}

export enum isActive {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
  DELETED = "DELETED",
}



export interface IUser {
  _id?: Types.ObjectId;   

  name: string;
  email: string;
  password: string;

  role: Role;

  profileImage?: string;   
  bio?: string;
  
  isActive?: isActive;

  interests?: string[];    
  visitedCountries?: string[];
  currentLocation?: string;

  plans?: Types.ObjectId[];           // references TravelPlan model
  reviewsReceived?: Types.ObjectId[]; // references Review model
  reviewsWritten?: Types.ObjectId[];  // references Review model


  subscription?: {
    subscriptionId?: string;
    isPremium: boolean;
    expiresAt?: Date;
  };

  createdAt?: Date;
  updatedAt?: Date;
}

