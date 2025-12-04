/* eslint-disable @typescript-eslint/no-unused-vars */


import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";
import { reviewServices } from "./review.service";
import httpStatus from "http-status-codes";


export const createReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const reviewerId = (req.user as { _id: string })?._id;
  const result = await reviewServices.createReview(reviewerId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Review created successfully",
    data: result,
  });
});


export const getAllReviews = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await reviewServices.getAllReviews(req.query as Record<string, string>);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reviews retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});


export const getReviewsForHost = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { hostId } = req.params;
  const result = await reviewServices.getReviewsForHost(
    hostId,
    req.query as Record<string, string>
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Host reviews retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

export const getReviewsWrittenByUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { reviewerId } = req.params;
  const result = await reviewServices.getReviewsWrittenByUser(
    reviewerId,
    req.query as Record<string, string>
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reviews written by user retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});


export const getReviewById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { reviewId } = req.params;
  const requestingUserId = (req.user as { _id: string })?._id;

  const result = await reviewServices.getReviewDetails(reviewId, requestingUserId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review retrieved successfully",
    data: result,
  });
});


export const getHostReviewStatistics = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { hostId } = req.params;
  const result = await reviewServices.getHostReviewStatistics(hostId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Host statistics retrieved successfully",
    data: result,
  });
});


export const getPlatformRatingStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await reviewServices.getPlatformRatingStats();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Platform statistics retrieved successfully",
    data: result,
  });
});


export const getTopRatedHosts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const minReviews = req.query.minReviews ? Number(req.query.minReviews) : 1;

  const result = await reviewServices.getTopRatedHosts(limit, minReviews);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Top rated hosts retrieved successfully",
    data: result,
  });
});

export const checkIfUserHasReviewedTravel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const reviewerId = (req.user as { _id: string })?._id;
    const { travelPlanId } = req.params;

    const hasReviewed = await reviewServices.checkIfUserHasReviewedTravel(
      reviewerId,
      travelPlanId
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Check completed successfully",
      data: { hasReviewed, travelPlanId },
    });
  }
);


export const validateReviewEligibility = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const reviewerId = (req.user as { _id: string })?._id;
    const { hostId, travelPlanId } = req.query as Record<string, string>;

    if (!hostId || !travelPlanId) {
      sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: "hostId and travelPlanId are required",
        data: null,
      });
      return;
    }

    const result = await reviewServices.validateReviewEligibility(
      reviewerId,
      hostId,
      travelPlanId
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Eligibility check completed",
      data: result,
    });
  }
);



export const reviewControllers = {
  createReview,
  getAllReviews,
  getReviewsForHost,
  getReviewsWrittenByUser,
  getReviewById,
  getHostReviewStatistics,
  getPlatformRatingStats,
  getTopRatedHosts,
  checkIfUserHasReviewedTravel,
  validateReviewEligibility,
};
