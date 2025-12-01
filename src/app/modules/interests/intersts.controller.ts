/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { interestService } from "./interests.service";

const createInterests = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await interestService.createInterests(req.body);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Interest created successfully",
      data: result,
    });
  }
);
const getAllInterests = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await interestService.getAllInterests();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All Interests retrieved successfully",
      data: result,
    });
  }
);
const getSingleInterest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    const result = await interestService.getSingleInterest({_id: id});
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Interest retrieved successfully",
      data: result,
    });
  }
);
const updatedInterest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
     const {id} = req.params;
    const result = await interestService.updateInterest({_id: id , ...req.body});
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Interest updated successfully",
      data: result,
    });
  }
);
const deletedInterest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
     const {id} = req.params;
     await interestService.deleteInterest({_id : id});
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Interest deleted successfully",
      data: null,
    });
  }
);


export const interestController = {
    createInterests,
    getAllInterests,
    getSingleInterest,
    updatedInterest,
    deletedInterest,
};
