import { Request, Response } from "express";
import { travelRequestService } from "./travelRequest.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";


const getAllTravelRequest = catchAsync(async (req: Request, res: Response) => { 
  const userId = req.user.userId;
  
    const travelRequests = await travelRequestService.getAllTravelRequest(userId, req.query as Record<string, string>);                      

    sendResponse(res, { 
      success: true,
      statusCode: 200,
      message: "Travel requests retrieved successfully",
      data: {...travelRequests},
    });
});


const getSingleTravelRequest = catchAsync(async (req: Request, res: Response) => { 
  const requestId = req.params.id;

  const travelRequest = await travelRequestService.getSingleTravelRequest(requestId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Travel request retrieved successfully",
    data: travelRequest,
  });
});


const createTravelRequest = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const payload = req.body;

  const travelRequest = await travelRequestService.createTravelRequest(userId, payload);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Travel request created successfully",
    data: travelRequest,
  });
});

const approveTravelRequest = catchAsync(async (req: Request, res: Response) => {
  const requestId = req.params.id;
  const hostId = req.user.userId;

  const approvedRequest = await travelRequestService.approveTravelRequest(requestId, hostId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Travel request approved successfully",
    data: approvedRequest,
  });
});

const rejectTravelRequest = catchAsync(async (req: Request, res: Response) => {
  const requestId = req.params.id;
  const hostId = req.user.userId;

  const rejectedRequest = await travelRequestService.rejectTravelRequest(requestId, hostId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Travel request rejected successfully",
    data: rejectedRequest,
  });
});

const deleteTravelRequest = catchAsync(async (req: Request, res: Response) => {
  const requestId = req.params.id;

  await travelRequestService.deleteTravelRequest(requestId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Travel request deleted successfully",
    data: null,
  });
});

export const travelRequestController = {
  createTravelRequest,
  approveTravelRequest,
  rejectTravelRequest,
  deleteTravelRequest,
  getAllTravelRequest,
  getSingleTravelRequest,
};
