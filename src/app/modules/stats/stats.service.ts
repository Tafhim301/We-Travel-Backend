/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../errorHandlers/appError";
import httpStatus from "http-status-codes";
import { Payment } from "../payment/payment.model";
import { isActive } from "../user/user.interface";
import { User } from "../user/user.model";
import { Review } from "../review/review.model";
import { TravelPlan } from "../TravelPlan/travelPlan.model";
import { TravelRequest } from "../travelRequest/travelRequest.model";
import { PAYMENT_STATUS as PaymentStatus,SUBSCRIPTION_TYPE as SubscriptionType } from "../payment/payment.interface";

const toDate = (input?: string | Date): Date | undefined => {
    if (!input) return undefined;
    const d = typeof input === "string" ? new Date(input) : input;
    if (isNaN(d.getTime())) return undefined;
    return d;
};

const buildDateMatch = (start?: Date, end?: Date) => {
    const match: any = {};
    if (start) match.$gte = start;
    if (end) match.$lte = end;
    if (Object.keys(match).length === 0) return {};
    return { createdAt: match };
};

/**
 * ADMIN DASHBOARD - COMPREHENSIVE OVERVIEW
 * Total users, active users, premium users, subscription breakdown
 */
const getAdminDashboardOverview = async (opts?: { startDate?: string; endDate?: string }) => {
    const start = toDate(opts?.startDate);
    const end = toDate(opts?.endDate);

    const [
        totalUsers,
        activeUsers,
        premiumUsers,
        subscriptionBreakdown,
        usersByStatus,
        usersByRole,
    ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: isActive.ACTIVE }),
        User.countDocuments({ "subscription.isPremium": true }),
        User.aggregate([
            { $match: { "subscription.isPremium": true } },
            { $group: { _id: "$subscription.subscriptionType", count: { $sum: 1 } } },
        ]),
        User.aggregate([
            { $group: { _id: "$isActive", count: { $sum: 1 } } },
        ]),
        User.aggregate([
            { $group: { _id: "$role", count: { $sum: 1 } } },
        ]),
    ]);

    const premiumPercentage = totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(2) : "0.00";
    const activePercentage = totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(2) : "0.00";

    const subscriptionStats = {
        monthly: subscriptionBreakdown.find((s: any) => s._id === SubscriptionType.MONTHLY)?.count || 0,
        yearly: subscriptionBreakdown.find((s: any) => s._id === SubscriptionType.YEARLY)?.count || 0,
    };

    const monthlySubscriptionPercentage = premiumUsers > 0 ? ((subscriptionStats.monthly / premiumUsers) * 100).toFixed(2) : "0.00";
    const yearlySubscriptionPercentage = premiumUsers > 0 ? ((subscriptionStats.yearly / premiumUsers) * 100).toFixed(2) : "0.00";

    const statusBreakdown = Object.fromEntries(
        usersByStatus.map((u: any) => [u._id || "unknown", u.count])
    );

    const roleBreakdown = Object.fromEntries(
        usersByRole.map((r: any) => [r._id || "unknown", r.count])
    );

    return {
        totalUsers,
        activeUsers,
        activePercentage,
        inactiveUsers: statusBreakdown[isActive.INACTIVE] || 0,
        blockedUsers: statusBreakdown[isActive.BLOCKED] || 0,
        premiumUsers,
        premiumPercentage,
        subscriptionBreakdown: subscriptionStats,
        monthlySubscriptionPercentage,
        yearlySubscriptionPercentage,
        usersByStatus: statusBreakdown,
        usersByRole: roleBreakdown,
    };
};


const getPaymentAndRevenueAnalytics = async (opts?: { startDate?: string; endDate?: string }) => {
    const start = toDate(opts?.startDate);
    const end = toDate(opts?.endDate);
    const dateMatch = buildDateMatch(start, end);

    const match = Object.keys(dateMatch).length > 0 ? dateMatch : {};

    const [
        totalPayments,
        paymentsByStatus,
        totalRevenue,
        averagePaymentAmount,
        paymentsBySubscriptionType,
    ] = await Promise.all([
        Payment.countDocuments(match),
        Payment.aggregate([
            { $match: match },
            { $group: { _id: "$paymentStatus", count: { $sum: 1 }, totalAmount: { $sum: "$amount" } } },
        ]),
        Payment.aggregate([
            { $match: { ...match, paymentStatus: PaymentStatus.PAID } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Payment.aggregate([
            { $match: match },
            { $group: { _id: null, avg: { $avg: "$amount" } } },
        ]),
        Payment.aggregate([
            { $match: { ...match, paymentStatus: PaymentStatus.PAID } },
            { $group: { _id: "$subscriptionType", count: { $sum: 1 }, revenue: { $sum: "$amount" } } },
        ]),
    ]);

    const statusBreakdown: any = {
        pending: 0,
        success: 0,
        failed: 0,
        cancelled: 0,
    };

    const statusRevenue: any = {
        pending: 0,
        success: 0,
        failed: 0,
        cancelled: 0,
    };

    paymentsByStatus.forEach((item: any) => {
        if (item._id) {
            statusBreakdown[item._id] = item.count;
            statusRevenue[item._id] = item.totalAmount || 0;
        }
    });

    const totalRevenueAmount = totalRevenue[0]?.total || 0;
    const avgPayment = averagePaymentAmount[0]?.avg || 0;

    const subscriptionTypeBreakdown = {
        monthly: paymentsBySubscriptionType.find((p: any) => p._id === SubscriptionType.MONTHLY) || { count: 0, revenue: 0 },
        yearly: paymentsBySubscriptionType.find((p: any) => p._id === SubscriptionType.YEARLY) || { count: 0, revenue: 0 },
    };

    const successPercentage = totalPayments > 0 ? ((statusBreakdown.success / totalPayments) * 100).toFixed(2) : "0.00";
    const pendingPercentage = totalPayments > 0 ? ((statusBreakdown.pending / totalPayments) * 100).toFixed(2) : "0.00";
    const failedPercentage = totalPayments > 0 ? ((statusBreakdown.failed / totalPayments) * 100).toFixed(2) : "0.00";
    const cancelledPercentage = totalPayments > 0 ? ((statusBreakdown.cancelled / totalPayments) * 100).toFixed(2) : "0.00";

    return {
        totalPayments,
        totalRevenue: totalRevenueAmount,
        averagePaymentAmount: avgPayment,
        paymentStatusBreakdown: {
            pending: statusBreakdown.pending || statusBreakdown.PENDING,
            success: statusBreakdown.PAID,
            failed: statusBreakdown.FAILED,
            cancelled: statusBreakdown.CANCELLED
        },
        paymentStatusPercentage: {
            pendingPercentage,
            successPercentage,
            failedPercentage,
            cancelledPercentage,
        },
        paymentStatusRevenue: statusRevenue,
        subscriptionTypeBreakdown,
    };
};

/**
 * TOP REVIEWED HOSTS
 * Best hosts by average rating and total reviews received
 */
const getTopReviewedHosts = async (opts?: { limit?: number }) => {
    const limit = Math.min(opts?.limit ?? 10, 50);

    const topHosts = await User.aggregate([
        {
            $match: {
                $expr: {
                    $and: [
                        { $gt: ["$totalReviewsReceived", 0] },
                        { $gt: ["$averageRating", 0] },
                    ]
                },
            },
        },
        {
            $project: {
                name: 1,
                email: 1,
                bio: 1,
                profileImage: 1,
                averageRating: 1,
                totalReviewsReceived: 1,
                ratingScore: { $multiply: ["$averageRating", "$totalReviewsReceived"] },
            },
        },
        { $sort: { ratingScore: -1 } },
        { $limit: limit },
        {
            $project: {
                _id: 1,
                name: 1,
                email: 1,
                bio: 1,
                profileImage: 1,
                averageRating: 1,
                totalReviewsReceived: 1,
            },
        },
    ]);

    return topHosts;
};

/**
 * TOP TRAVEL DESTINATIONS
 * Most popular destinations based on travel plans
 */
const getTopDestinations = async (opts?: { limit?: number }) => {
    const limit = Math.min(opts?.limit ?? 10, 50);

    const topDestinations = await TravelPlan.aggregate([
        {
            $group: {
                _id: "$destination",
                count: { $sum: 1 },
                avgBudgetMin: { $avg: "$budgetRange.min" },
                avgBudgetMax: { $avg: "$budgetRange.max" },
            },
        },
        { $sort: { count: -1 } },
        { $limit: limit },
        {
            $lookup: {
                from: "locations",
                localField: "_id",
                foreignField: "_id",
                as: "destinationInfo",
            },
        },
        { $unwind: { path: "$destinationInfo", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                _id: 1,
                totalPlans: "$count",
                destinationName: "$destinationInfo.name",
                destinationCountry: "$destinationInfo.country",
                avgBudgetMin: { $round: ["$avgBudgetMin", 2] },
                avgBudgetMax: { $round: ["$avgBudgetMax", 2] },
            },
        },
    ]);

    return topDestinations;
};

/**
 * TRAVEL PLAN STATISTICS
 * Total plans, by type, and engagement metrics
 */
const getTravelPlanStats = async (opts?: { startDate?: string; endDate?: string }) => {
    const start = toDate(opts?.startDate);
    const end = toDate(opts?.endDate);
    const dateMatch = buildDateMatch(start, end);

    const match = Object.keys(dateMatch).length > 0 ? dateMatch : {};

    const [
        totalPlans,
        plansByType,
        plansWithRequests,
        plansWithApprovedMembers,
        plansWithReviews,
        avgMembersPerPlan,
    ] = await Promise.all([
        TravelPlan.countDocuments(match),
        TravelPlan.aggregate([
            { $match: match },
            { $group: { _id: "$travelType", count: { $sum: 1 } } },
        ]),
        TravelPlan.countDocuments({ ...match, requestedBy: { $exists: true, $ne: [] } }),
        TravelPlan.countDocuments({ ...match, approvedMembers: { $exists: true, $ne: [] } }),
        TravelPlan.aggregate([
            { $match: match },
            {
                $lookup: {
                    from: "reviews",
                    localField: "_id",
                    foreignField: "travelPlan",
                    as: "reviews",
                },
            },
            { $match: { reviews: { $ne: [] } } },
            { $count: "count" },
        ]),
        TravelPlan.aggregate([
            { $match: match },
            {
                $project: {
                    totalMembers: {
                        $add: [
                            { $size: { $ifNull: ["$requestedBy", []] } },
                            { $size: { $ifNull: ["$approvedMembers", []] } },
                        ],
                    },
                },
            },
            { $group: { _id: null, avgMembers: { $avg: "$totalMembers" } } },
        ]),
    ]);

    const typeBreakdown = Object.fromEntries(
        plansByType.map((p: any) => [p._id || "unknown", p.count])
    );

    return {
        totalPlans,
        plansByType: typeBreakdown,
        plansWithRequests,
        plansWithApprovedMembers,
        plansWithReviews: plansWithReviews[0]?.count || 0,
        avgMembersPerPlan: avgMembersPerPlan[0]?.avgMembers || 0,
    };
};

/**
 * TRAVEL REQUEST STATISTICS
 * Request status breakdown and response metrics
 */
const getTravelRequestStats = async (opts?: { startDate?: string; endDate?: string }) => {
    const start = toDate(opts?.startDate);
    const end = toDate(opts?.endDate);
    const dateMatch = buildDateMatch(start, end);

    const match = Object.keys(dateMatch).length > 0 ? dateMatch : {};

    const [totalRequests, requestsByStatus] = await Promise.all([
        TravelRequest.countDocuments(match),
        TravelRequest.aggregate([
            { $match: match },
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
    ]);

    const statusBreakdown = Object.fromEntries(
        requestsByStatus.map((r: any) => [r._id || "unknown", r.count])
    );

    return {
        totalRequests,
        requestsByStatus: statusBreakdown,
    };
};

/**
 * REVIEW STATISTICS
 * Total reviews, average ratings, review trends
 */
const getReviewStats = async (opts?: { startDate?: string; endDate?: string }) => {
    const start = toDate(opts?.startDate);
    const end = toDate(opts?.endDate);
    const dateMatch = buildDateMatch(start, end);

    const match = Object.keys(dateMatch).length > 0 ? dateMatch : {};

    const [
        totalReviews,
        avgRating,
        ratingDistribution,
    ] = await Promise.all([
        Review.countDocuments(match),
        Review.aggregate([
            { $match: match },
            { $group: { _id: null, avgRating: { $avg: "$rating" } } },
        ]),
        Review.aggregate([
            { $match: match },
            { $group: { _id: "$rating", count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]),
    ]);

    const ratingDist = Object.fromEntries(
        ratingDistribution.map((r: any) => [`${r._id}_stars`, r.count])
    );

    return {
        totalReviews,
        averageRating: avgRating[0]?.avgRating || 0,
        ratingDistribution: ratingDist,
    };
};

/**
 * USER GROWTH & ENGAGEMENT
 * New users over time, daily/monthly trends
 */
const getUserGrowthAnalytics = async (opts?: { startDate?: string; endDate?: string; groupBy?: "day" | "week" | "month" }) => {
    const start = toDate(opts?.startDate);
    const end = toDate(opts?.endDate);
    const groupBy = opts?.groupBy || "day";

    const dateMatch = buildDateMatch(start, end);
    const match = Object.keys(dateMatch).length > 0 ? dateMatch : {};

    const dateFormats: Record<string, string> = {
        day: "%Y-%m-%d",
        week: "%Y-W%V",
        month: "%Y-%m",
    };

    const [userGrowth, cumulativeUsers] = await Promise.all([
        User.aggregate([
            { $match: match },
            {
                $group: {
                    _id: { $dateToString: { format: dateFormats[groupBy], date: "$createdAt" } },
                    newUsers: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]),
        User.countDocuments(),
    ]);

    return {
        userGrowthTrend: userGrowth,
        totalCumulativeUsers: cumulativeUsers,
        groupedBy: groupBy,
    };
};

/**
 * ADMIN FULL DASHBOARD
 * Comprehensive overview for admin
 */
const getAdminFullDashboard = async (opts?: { startDate?: string; endDate?: string }) => {
    const [
        userOverview,
        paymentAnalytics,
        travelPlanStats,
        travelRequestStats,
        reviewStats,
        topHosts,
        topDestinations,
        userGrowth,
    ] = await Promise.all([
        getAdminDashboardOverview(opts),
        getPaymentAndRevenueAnalytics(opts),
        getTravelPlanStats(opts),
        getTravelRequestStats(opts),
        getReviewStats(opts),
        getTopReviewedHosts({ limit: 5 }),
        getTopDestinations({ limit: 5 }),
        getUserGrowthAnalytics(opts),
    ]);

    return {
        userOverview,
        paymentAnalytics,
        travelPlanStats,
        travelRequestStats,
        reviewStats,
        topHosts,
        topDestinations,
        userGrowth,
    };
};


const getUserPersonalDashboard = async (userId: string) => {
    if (!userId) throw new AppError(httpStatus.BAD_REQUEST, "userId is required");

    const [
        user,
        travelPlansCount,
        sentRequests,
        receivedRequests,
        reviews,
        reviewsReceived,
        subscriptionStatus,
    ] = await Promise.all([
        User.findById(userId),
        TravelPlan.countDocuments({ user: userId }),
        TravelRequest.countDocuments({ requester: userId }),
        TravelRequest.countDocuments({ host: userId }),
        Review.countDocuments({ reviewer: userId }),
        Review.countDocuments({ host: userId }),
        User.findById(userId).select("subscription"),
    ]);

    if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

    const now = new Date();
    const hasActiveSubscription = subscriptionStatus?.subscription?.isPremium &&
        subscriptionStatus?.subscription?.expiresAt &&
        new Date(subscriptionStatus.subscription.expiresAt) > now;

    let daysUntilExpiry = 0;
    if (hasActiveSubscription && subscriptionStatus?.subscription?.expiresAt) {
        const expiryTime = new Date(subscriptionStatus.subscription.expiresAt).getTime();
        daysUntilExpiry = Math.ceil((expiryTime - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    // -------------------
    // Recent Travels by You (latest 5 plans)
    // -------------------
    const recentTravelsByYou = await TravelPlan.aggregate([
        { $match: { user: user._id } },
        { $sort: { createdAt: -1 } },
        { $limit: 5 },
          {
        $lookup: {
            from: "locations",
            localField: "destination",
            foreignField: "_id",
            as: "destination",
        },
    },
    { $unwind: "$destination" },
        {
            $project: {
                _id: 1,
              destination: {
                $concat: [
                    "$destination.destination", ", ",
                    "$destination.city", ", ",
                    "$destination.country"
                ]
            },
                startDate: 1,
                endDate: 1,
                status: 1,
            },
        },
    ]);

    // -------------------
    // Recently Added Travels (community) - latest 5 plans from other users
    // -------------------
const recentCommunityTravels = await TravelPlan.aggregate([
    { $match: { user: { $ne: user._id } } },
    { $sort: { createdAt: -1 } },
    { $limit: 5 },
    {
        $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "author",
        },
    },
    { $unwind: "$author" },
    {
        $lookup: {
            from: "locations",
            localField: "destination",
            foreignField: "_id",
            as: "destination",
        },
    },
    { $unwind: "$destination" },
    {
        $project: {
            _id: 1,
            destination: {
                $concat: [
                    "$destination.destination", ", ",
                    "$destination.city", ", ",
                    "$destination.country"
                ]
            },
            createdAt: 1,
            authorName: "$author.name",
        },
    },
]);


    return {
        user,
        travelActivity: {
            totalPlans: travelPlansCount,
            sentRequests,
            receivedRequests,
            totalReviewsGiven: reviews,
            totalReviewsReceived: reviewsReceived,
        },
        subscription: {
            hasActive: hasActiveSubscription,
            type: subscriptionStatus?.subscription?.isPremium ? "premium" : "free",
            expiresAt: subscriptionStatus?.subscription?.expiresAt || null,
            daysRemaining: daysUntilExpiry,
        },
        recentTravelsByYou,
        recentCommunityTravels,
    };
};


export const statsService = {
    getAdminDashboardOverview,
    getPaymentAndRevenueAnalytics,
    getTopReviewedHosts,
    getTopDestinations,
    getTravelPlanStats,
    getTravelRequestStats,
    getReviewStats,
    getUserGrowthAnalytics,
    getAdminFullDashboard,
    getUserPersonalDashboard,
};
