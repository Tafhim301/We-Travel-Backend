/* eslint-disable @typescript-eslint/no-dynamic-delete */
import { ITravelPlan } from "./travelPlan.interface";
import { TravelPlan } from "./travelPlan.model";
import { uploadBufferCloudinary } from "../../utils/cloudinaryUploader";
import AppError from "../../errorHandlers/appError";
import { QueryBuilder } from "../../utils/queryBuilder";
import mongoose from "mongoose";
import { deleteFromCloudinaryByUrl } from "../../utils/cloudinaryDelete";
import { TravelRequestStatus } from "../travelRequest/travelRequest.interface";
import { TravelRequest } from "../travelRequest/travelRequest.model";

interface TravelPlanFiles {
  image?: Express.Multer.File;
  demoImages?: Express.Multer.File[];
}

interface UpdateTravelPlanPayload extends Partial<ITravelPlan> {
  image?: string;
  demoImages?: string[];
  removeImages?: string[];
}
export const createTravelPlan = async (
  userId: string,
  payload: { body: Partial<ITravelPlan> },
  files?: TravelPlanFiles
) => {
  const session = await mongoose.startSession();
  session.startTransaction();



  try {
    let imageUrl = "";
    const demoImagesUrl: string[] = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (payload.body.startDate) {
      const start = new Date(payload.body.startDate);
      if (start < today) {
        throw new AppError(400, "Start Date cannot be earlier than today");
      }
    }

 
    if (files?.image) {
      const result = await uploadBufferCloudinary(
        files.image.buffer,
        files.image.originalname,
        "travel-plans"
      );
      imageUrl = result.secure_url;
    }

    // --- UPLOAD DEMO IMAGES ---
    if (files?.demoImages?.length) {
      for (const file of files.demoImages) {
        const result = await uploadBufferCloudinary(
          file.buffer,
          file.originalname,
          "travel-plans/demos"
        );
        demoImagesUrl.push(result.secure_url);
      }
    }


    const travelPlan = await TravelPlan.create(
      [
        {
          user: userId,
          ...payload.body,
          image: imageUrl,
          demoImages: demoImagesUrl,
          requestedBy: [userId], 
        },
      ],
      { session }
    );

    const plan = travelPlan[0];

    await TravelRequest.create(
      [
        {
          travelPlan: plan._id,
          requester: userId,
          host: userId,
          status: TravelRequestStatus.ACCEPTED,
          message: "Creator automatically accepted into the plan",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return plan;
  } catch (error) {

    await session.abortTransaction();
    session.endSession();

    throw error;
  }
};

const getTravelPlans = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(
    TravelPlan.find().populate("destination"),
    query
  );

  const plans = await queryBuilder
    .sort()
    .filter()
    .search(["title", "travelType"])
    .paginate()
    .fields()
    .build();

  const meta = await queryBuilder.getMeta();

  return { data: plans, meta };
};



const getTravelPlanById = async (planId: string) => {
  const plan = await TravelPlan.findById(planId).populate(
    "destination user requestedBy"
  );
  if (!plan) throw new AppError(404, "TravelPlan not found");
  return plan;
};



const getTravelPlansByUserId = async (userId: string) => {
  const plans = await TravelPlan.find({ user: userId });
  return plans;
};


export const updateTravelPlan = async (
  planId: string,
  payload: UpdateTravelPlanPayload,
  files?: TravelPlanFiles
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const plan = await TravelPlan.findById(planId).session(session);
    if (!plan) throw new AppError(404, "TravelPlan not found");


    const restrictedFields = [
      "title",
      "description",
      "destination",
      "startDate",
      "endDate",
      "budgetRange",
      "travelType",
      "itinerary",
    ];

    const message: { field: string; reason: string }[] = [];

    for (const field of Object.keys(payload)) {
      if (restrictedFields.includes(field)) {
        message.push({ field, reason: `Field '${field}' is not editable` });
        delete payload[field as keyof UpdateTravelPlanPayload];
      }
    }

    if (files?.image) {
      const uploaded = await uploadBufferCloudinary(
        files.image.buffer,
        files.image.originalname,
        "travel-plans"
      );

      payload.image = uploaded.secure_url;
    }

    let updatedDemoImages = [...(plan.demoImages ?? [])];


    if (files?.demoImages?.length) {
      for (const file of files.demoImages) {
        const uploaded = await uploadBufferCloudinary(
          file.buffer,
          file.originalname,
          "travel-plans/demos"
        );

        updatedDemoImages.push(uploaded.secure_url);
      }
    }

    if (payload.removeImages?.length) {
      for (const imgUrl of payload.removeImages) {

        await deleteFromCloudinaryByUrl(imgUrl);



        updatedDemoImages = updatedDemoImages.filter((x) => x !== imgUrl);
      }
    }

    payload.demoImages = updatedDemoImages;


    const updatedPlan = await TravelPlan.findByIdAndUpdate(
      planId,
      payload,
      {
        new: true,
        runValidators: true,
        session,
      }
    );

    if (!updatedPlan) throw new AppError(400, "Failed to update TravelPlan");

    await session.commitTransaction();
    session.endSession();

    return { updatedPlan, message };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};


const deleteTravelPlan = async (planId: string,userId:string) => {
  const plan = await TravelPlan.findById(planId);
  if (!plan) throw new AppError(404, "TravelPlan not found");
  if(userId !== plan.user.toString()){
    throw new AppError(403, "You are not authorized to delete this plan");
  }



  const deletePlan = await TravelPlan.findByIdAndDelete(planId);

  return deletePlan;
};

export const travelPlanServices = {
  createTravelPlan,
  getTravelPlans,
  getTravelPlanById,
  updateTravelPlan,
  deleteTravelPlan,
  getTravelPlansByUserId
};
