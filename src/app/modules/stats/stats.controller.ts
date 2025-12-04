/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";
import { statsService } from "./stats.service";
import httpStatus from "http-status-codes";

/**
 * ADMIN ENDPOINTS
 */

export const getAdminDashboard = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { startDate, endDate } = req.query as Record<string, string>;
    const result = await statsService.getAdminFullDashboard({ startDate, endDate });
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admin dashboard retrieved successfully",
        data: result,
    });
});

export const getAdminOverview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { startDate, endDate } = req.query as Record<string, string>;
    const result = await statsService.getAdminDashboardOverview({ startDate, endDate });
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admin overview retrieved successfully",
        data: result,
    });
});

export const getPaymentAnalytics = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { startDate, endDate } = req.query as Record<string, string>;
    const result = await statsService.getPaymentAndRevenueAnalytics({ startDate, endDate });
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Payment and revenue analytics retrieved successfully",
        data: result,
    });
});

export const getTravelPlanAnalytics = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { startDate, endDate } = req.query as Record<string, string>;
    const result = await statsService.getTravelPlanStats({ startDate, endDate });
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Travel plan analytics retrieved successfully",
        data: result,
    });
});

export const getTravelRequestAnalytics = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { startDate, endDate } = req.query as Record<string, string>;
    const result = await statsService.getTravelRequestStats({ startDate, endDate });
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Travel request analytics retrieved successfully",
        data: result,
    });
});

export const getReviewAnalytics = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { startDate, endDate } = req.query as Record<string, string>;
    const result = await statsService.getReviewStats({ startDate, endDate });
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Review analytics retrieved successfully",
        data: result,
    });
});

export const getUserGrowthAnalytics = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { startDate, endDate, groupBy } = req.query as Record<string, string>;
    const validGroupBy = (["day", "week", "month"].includes(groupBy) ? groupBy : "day") as "day" | "week" | "month";
    const result = await statsService.getUserGrowthAnalytics({ startDate, endDate, groupBy: validGroupBy });
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User growth analytics retrieved successfully",
        data: result,
    });
});

export const getTopReviewedHosts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const limit = Number(req.query.limit) || 10;
    const result = await statsService.getTopReviewedHosts({ limit });
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Top reviewed hosts retrieved successfully",
        data: result,
    });
});

export const getTopDestinations = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const limit = Number(req.query.limit) || 10;
    const result = await statsService.getTopDestinations({ limit });
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Top destinations retrieved successfully",
        data: result,
    });
});

/**
 * USER ENDPOINTS
 */

export const getUserDashboard = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as { userId?: string })?.userId;
    const result = await statsService.getUserPersonalDashboard(userId as string);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User dashboard retrieved successfully",
        data: result,
    });
});

export const statsControllers = {
    // Admin
    getAdminDashboard,
    getAdminOverview,
    getPaymentAnalytics,
    getTravelPlanAnalytics,
    getTravelRequestAnalytics,
    getReviewAnalytics,
    getUserGrowthAnalytics,
    getTopReviewedHosts,
    getTopDestinations,
    // User
    getUserDashboard,
};
