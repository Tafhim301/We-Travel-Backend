// travelPlan.controller.ts
import { Request, Response } from "express";
import { travelPlanServices } from "./travelPlan.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const createTravelPlan = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const files = { image: req.file, demoImages: (req.files as Express.Multer.File[] | undefined) };

  const result = await travelPlanServices.createTravelPlan(userId, req.body, files);

  sendResponse(res, 
    { success: true, 
     statusCode: 200,
     message: "TravelPlan created successfully",
     data: result });
});

const getTravelPlans = catchAsync(async (req: Request, res: Response) => {
  const result = await travelPlanServices.getTravelPlans(req.query as Record<string, string>);
  sendResponse(res, { success: true,
     statusCode: 200, 
     message: "TravelPlans retrieved",
    ...result });
});

const getTravelPlanById = catchAsync(async (req: Request, res: Response) => {
  const planId = req.params.id;
  const result = await travelPlanServices.getTravelPlanById(planId);
  sendResponse(res, { success: true, statusCode: 200, message: "TravelPlan retrieved successfully", data: result });
});



const updateTravelPlan = catchAsync(async (req: Request, res: Response) => {
  const planId = req.params.id;

  const body = req.body.body;

  interface TravelPlanFiles {
  image?: Express.Multer.File;
  demoImages?: Express.Multer.File[];
}



const files: TravelPlanFiles = {
  image: Array.isArray(req.files)
    ? undefined
    : req.files?.image?.[0],

  demoImages: Array.isArray(req.files)
    ? []
    : (req.files?.demoImages ?? []),
};




  const updatedPlan = await travelPlanServices.updateTravelPlan(planId, body, files);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Travel plan updated successfully",
    data: {
      updatedPlan: updatedPlan.updatedPlan,
      message: updatedPlan.message,
    }
  });
});




const deleteTravelPlan = catchAsync(async (req: Request, res: Response) => {
  const planId = req.params.id;
  await travelPlanServices.deleteTravelPlan(planId);
  sendResponse(res, { success: true, statusCode: 200, message: "TravelPlan deleted successfully", data: null });
});

export const travelPlanController = {
  createTravelPlan,
  getTravelPlans,
  getTravelPlanById,
  updateTravelPlan,
  deleteTravelPlan,
};
