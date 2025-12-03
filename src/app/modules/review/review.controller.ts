/**
 * REVIEW CONTROLLER IMPLEMENTATION GUIDE
 * This file shows how to implement the review controller to use the review service
 * 
 * Copy and adapt these patterns for your review.controller.ts
 */

import { Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";
import { reviewServices } from "./review.service";
import httpStatus from "http-status-codes";

/**
 * CREATE REVIEW
 * POST /api/reviews
 * Body: { host, travelPlan, rating, comment }
 * Auth: Required (reviewer is from JWT)
 */
export const createReview = catchAsync(async (req: Request, res: Response) => {
  const reviewerId = (req.user as { _id: string })?._id;
  const result = await reviewServices.createReview(reviewerId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Review created successfully",
    data: result,
  });
});

/**
 * GET ALL REVIEWS (PLATFORM WIDE)
 * GET /api/reviews
 * Query params: page, limit, sort, fields, etc.
 */
export const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await reviewServices.getAllReviews(req.query as Record<string, string>);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reviews retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

/**
 * GET REVIEWS FOR A HOST
 * GET /api/reviews/host/:hostId
 * Query params: page, limit, sort, fields, etc.
 */
export const getReviewsForHost = catchAsync(async (req: Request, res: Response) => {
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

/**
 * GET REVIEWS WRITTEN BY USER
 * GET /api/reviews/written/:reviewerId
 * Query params: page, limit, sort, fields, etc.
 */
export const getReviewsWrittenByUser = catchAsync(async (req: Request, res: Response) => {
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

/**
 * GET SINGLE REVIEW
 * GET /api/reviews/:reviewId
 */
export const getReviewById = catchAsync(async (req: Request, res: Response) => {
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

/**
 * GET HOST REVIEW STATISTICS
 * GET /api/reviews/stats/host/:hostId
 * Returns: averageRating, totalReviews, ratingDistribution, etc.
 */
export const getHostReviewStatistics = catchAsync(async (req: Request, res: Response) => {
  const { hostId } = req.params;
  const result = await reviewServices.getHostReviewStatistics(hostId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Host statistics retrieved successfully",
    data: result,
  });
});

/**
 * GET PLATFORM RATING STATISTICS
 * GET /api/reviews/stats/platform
 * Returns: averageRating, totalReviews, maxRating, minRating
 */
export const getPlatformRatingStats = catchAsync(async (req: Request, res: Response) => {
  const result = await reviewServices.getPlatformRatingStats();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Platform statistics retrieved successfully",
    data: result,
  });
});

/**
 * GET TOP RATED HOSTS
 * GET /api/reviews/top-hosts?limit=10&minReviews=3
 */
export const getTopRatedHosts = catchAsync(async (req: Request, res: Response) => {
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

/**
 * CHECK IF USER HAS REVIEWED TRAVEL
 * GET /api/reviews/check/:travelPlanId
 * Auth: Required (checks if current user has reviewed)
 */
export const checkIfUserHasReviewedTravel = catchAsync(
  async (req: Request, res: Response) => {
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

/**
 * VALIDATE REVIEW ELIGIBILITY (PRE-FLIGHT CHECK)
 * GET /api/reviews/validate-eligibility?hostId=...&travelPlanId=...
 * Auth: Required (checks current user's eligibility)
 * Useful for showing/hiding review form UI
 */
export const validateReviewEligibility = catchAsync(
  async (req: Request, res: Response) => {
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
