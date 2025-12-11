import mongoose from "mongoose";
import AppError from "../../errorHandlers/appError";
import { TravelPlan } from "../TravelPlan/travelPlan.model";
import { User } from "../user/user.model";
import { ITravelRequest, TravelRequestStatus } from "./travelRequest.interface";
import { TravelRequest } from "./travelRequest.model";
import { QueryBuilder } from "../../utils/queryBuilder";



const getAllTravelRequest = async (
  userId: string,
  query: Record<string, string>
) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(404, "User Not Found");

  const baseQuery = TravelRequest.find({
    $and: [
      { $or: [{ requester: userId }, { host: userId }] },
      { $expr: { $ne: ["$requester", "$host"] } }
    ]
  }).populate("travelPlan requester host");

  const queryBuilder = new QueryBuilder(baseQuery, query);

  const requests = await queryBuilder
    .filter()
    .search(["message", "status"])
    .sort()
    .paginate()
    .fields()
    .build();

  const meta = await queryBuilder.getMeta();

  if (!requests || requests.length === 0) {
    throw new AppError(404, "No Travel Requests Found");
  }

  return { data: requests, meta };
};

export { getAllTravelRequest };



const getSingleTravelRequest = async (requestId: string) => {
    const travelRequest = await TravelRequest.findById(requestId);
    if (!travelRequest) {
        throw new AppError(404, "Travel Request Not Found");
    }
    return travelRequest;
}


const createTravelRequest = async (
  userId: string,
  payload: ITravelRequest
) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(404, "User Not Found");


  const travelPlan = await TravelPlan.findById(payload?.travelPlan);
 
  if (!travelPlan) throw new AppError(404, "Travel Plan Not Found");


  const alreadyRequested = await TravelRequest.findOne({
    travelPlan: payload.travelPlan,
    requester: userId,
  });

  if (alreadyRequested) {
    throw new AppError(400, "You already requested to join this travel plan");
  }

 
  const totalApprovedMembers = await TravelRequest.countDocuments({
    travelPlan: payload.travelPlan,
    status: TravelRequestStatus.ACCEPTED,
  });

  if (totalApprovedMembers >= travelPlan.maxMembers) {
    throw new AppError(400, "Member limit already reached");
  }

  const travelRequest = await TravelRequest.create({
    travelPlan: payload.travelPlan,
    requester: userId,
    host: travelPlan.user,
    status: TravelRequestStatus.PENDING,
    message: payload.message || "",
  });

  await TravelPlan.findByIdAndUpdate(payload.travelPlan, {
    $push: { requestedBy: userId },
  });




  return travelRequest;
};



const approveTravelRequest = async (requestId: string, hostId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const travelRequest = await TravelRequest.findById(requestId).session(session);
    if (!travelRequest) throw new AppError(404, "Travel Request Not Found");

    if (travelRequest.host.toString() !== hostId) {
      throw new AppError(403, "Not authorized to approve this request");
    }

    if (travelRequest.status !== TravelRequestStatus.PENDING) {
      throw new AppError(400, "This request is already processed");
    }

    const travelPlan = await TravelPlan.findById(travelRequest.travelPlan).session(session);
    if (!travelPlan) throw new AppError(404, "Travel Plan Not Found");

    if (travelPlan.approvedMembers.length >= travelPlan.maxMembers) {
      throw new AppError(400, "Maximum members limit reached");
    }

    
    travelRequest.status = TravelRequestStatus.ACCEPTED;
    travelPlan.approvedMembers.push(travelRequest.requester);

    await travelRequest.save({ session });
    await travelPlan.save({ session });

    await session.commitTransaction();
    session.endSession();

    return travelRequest;

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};


const rejectTravelRequest = async (requestId: string, hostId: string) => { 
    const travelRequest = await TravelRequest.findById(requestId);
    if (!travelRequest) { 
        throw new AppError(404, "Travel Request Not Found");
    }
    if (travelRequest.host.toString() !== hostId) { 
        throw new AppError(403, "Not authorized to reject this request");
    }           
    if (travelRequest.status !== TravelRequestStatus.PENDING) { 
        throw new AppError(400, "This request is already processed");
    }
    travelRequest.status = TravelRequestStatus.REJECTED;
    await travelRequest.save();
    return travelRequest;
}

const deleteTravelRequest = async (requestId: string) => {
  const travelRequest = await TravelRequest.findByIdAndDelete(requestId);
    if (!travelRequest) { 
        throw new AppError(404, "Travel Request Not Found");
    }
    return travelRequest;
}


export const travelRequestService = {
  createTravelRequest,
  approveTravelRequest,
  deleteTravelRequest,
  rejectTravelRequest,
  getAllTravelRequest,
  getSingleTravelRequest,
};
