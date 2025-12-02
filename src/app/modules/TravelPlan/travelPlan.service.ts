/* eslint-disable @typescript-eslint/no-non-null-assertion */
// travelPlan.service.ts
import { ITravelPlan } from "./travelPlan.interface";
import { TravelPlan } from "./travelPlan.model";
import { uploadBufferCloudinary } from "../../utils/cloudinaryUploader";
import AppError from "../../errorHandlers/appError";
import { QueryBuilder } from "../../utils/queryBuilder";

interface TravelPlanFiles {
  image?: Express.Multer.File;
  demoImages?: Express.Multer.File[];
}
interface UpdateTravelPlanPayload extends Partial<ITravelPlan> {
  image?: string;
  demoImages?: string[];
  removeImages?: string[]; 
}

const createTravelPlan = async (
  userId: string,
  payload: {body : Partial<ITravelPlan>},
  files?: TravelPlanFiles
) => {
  let imageUrl = "";
  const demoImagesUrl: string[] = [];

  if (files?.image) {
    const result = await uploadBufferCloudinary(files.image.buffer, files.image.originalname, "travel-plans");
    imageUrl = result.secure_url;
  }

  if (files?.demoImages?.length) {
    for (const file of files.demoImages) {
      const result = await uploadBufferCloudinary(file.buffer, file.originalname, "travel-plans/demos");
      demoImagesUrl.push(result.secure_url);
    }
  }

  const travelPlan = await TravelPlan.create({
    user: userId,
    ...payload.body,
    image: imageUrl,
    demoImages: demoImagesUrl,
  });

  return travelPlan;
};

const getTravelPlans = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(TravelPlan.find().populate("destination"), query);
  const plans = await queryBuilder.sort().filter().search(["title","travelType"]).paginate().fields().build();
  const meta = await queryBuilder.getMeta();
  return { data: plans, meta };
};

const getTravelPlanById = async (planId: string) => {
  const plan = await TravelPlan.findById(planId).populate("destination user requestedBy");
  if (!plan) throw new AppError(404, "TravelPlan not found");
  return plan;
};
export const updateTravelPlan = async (
  planId: string,
  payload:  UpdateTravelPlanPayload,
  files?: TravelPlanFiles
) => {
  
  const plan = await TravelPlan.findById(planId);
  if (!plan) throw new AppError(404, "TravelPlan not found");

  if (files?.image) {
    const result = await uploadBufferCloudinary(
      files.image.buffer,
      files.image.originalname,
      "travel-plans"
    );
    payload.image = result.secure_url;
  }


  if (files?.demoImages?.length) {
    const uploadedDemoImages: string[] = [];
    for (const file of files.demoImages) {
      const result = await uploadBufferCloudinary(
        file.buffer,
        file.originalname,
        "travel-plans/demos"
      );
      uploadedDemoImages.push(result.secure_url);
    }
    payload.demoImages = [...(plan.demoImages || []), ...uploadedDemoImages];
  }
  if (payload?.removeImages?.length) {
    payload.demoImages = (payload.demoImages || plan.demoImages || []).filter(
      (img) => !payload.removeImages!.includes(img)
    );
  }


  const updatedPlan = await TravelPlan.findByIdAndUpdate(planId, payload, {
    new: true,
    runValidators: true,
  });

  return updatedPlan;
};

const deleteTravelPlan = async (planId: string) => {
  const plan = await TravelPlan.findByIdAndDelete(planId);
  if (!plan) throw new AppError(404, "TravelPlan not found");
  return plan;
};

export const travelPlanServices = {
  createTravelPlan,
  getTravelPlans,
  getTravelPlanById,
  updateTravelPlan,
  deleteTravelPlan,
};
