import mongoose from "mongoose";
import AppError from "../../errorHandlers/appError";
import { QueryBuilder } from "../../utils/queryBuilder";
import { IReview } from "./review.interface";
import { Review } from "./review.model";
import { TravelRequest } from "../travelRequest/travelRequest.model";
import { TravelPlan } from "../TravelPlan/travelPlan.model";
import { User } from "../user/user.model";
import { TravelRequestStatus } from "../travelRequest/travelRequest.interface";
import httpStatus from "http-status-codes";

/**
 * Calculate and update the average rating for a host
 * This function aggregates all reviews for a host and updates their averageRating
 */
const calculateAndUpdateAverageRating = async (
    hostId: string,
    session?: mongoose.ClientSession
): Promise<void> => {
    // Aggregate all reviews for the host to get average rating
    const result = await Review.aggregate([
        { $match: { host: new mongoose.Types.ObjectId(hostId) } },
        {
            $group: {
                _id: "$host",
                averageRating: { $avg: "$rating" },
                totalReviews: { $sum: 1 },
            },
        },
    ]);

    const averageRating = result.length > 0 ? result[0].averageRating : 0;
    const totalReviewsReceived = result.length > 0 ? result[0].totalReviews : 0;

    // Update the host's user profile with new average rating
    if (session) {
        await User.findByIdAndUpdate(
            hostId,
            {
                averageRating: parseFloat(averageRating.toFixed(2)),
                totalReviewsReceived,
            },
            { session, new: true }
        );
    } else {
        await User.findByIdAndUpdate(
            hostId,
            {
                averageRating: parseFloat(averageRating.toFixed(2)),
                totalReviewsReceived,
            },
            { new: true }
        );
    }
};

/**
 * Create a new review with comprehensive validation
 * - Validates reviewer exists
 * - Validates host exists
 * - Validates travel plan exists and has ended
 * - Validates that the reviewer was accepted in the travel plan
 * - Validates that only one review per travel plan per reviewer
 * - Updates host's average rating
 */
const createReview = async (
    reviewerId: string,
    payload: Partial<IReview>
): Promise<IReview> => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. VALIDATE REVIEWER EXISTS
        const reviewer = await User.findById(reviewerId).session(session);
        if (!reviewer) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                "Reviewer user not found"
            );
        }

        // 2. VALIDATE HOST EXISTS
        if (!payload.host) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                "Host ID is required"
            );
        }

        const host = await User.findById(payload.host).session(session);
        if (!host) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                "Host user not found"
            );
        }

        // 3. PREVENT SELF-REVIEW
        if (reviewerId === payload.host.toString()) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                "You cannot review yourself"
            );
        }

        // 4. VALIDATE TRAVEL PLAN EXISTS
        if (!payload.travelPlan) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                "Travel plan ID is required"
            );
        }

        const travelPlan = await TravelPlan.findById(payload.travelPlan).session(session);
        if (!travelPlan) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                "Travel plan not found"
            );
        }

        // 5. VALIDATE TRAVEL IS COMPLETED (endDate has passed)
        const currentDate = new Date();
        if (travelPlan.endDate > currentDate) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                `Travel plan has not ended yet. End date: ${travelPlan.endDate.toISOString()}. You can only review after the travel is completed`
            );
        }

        // 6. VALIDATE THAT REVIEWER WAS AN ACCEPTED MEMBER IN THE TRAVEL
        const travelRequest = await TravelRequest.findOne({
            travelPlan: payload.travelPlan,
            requester: reviewerId,
            status: TravelRequestStatus.ACCEPTED,
        }).session(session);

        if (!travelRequest) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You were not an accepted member of this travel plan. Only accepted members can review"
            );
        }

        // 7. VALIDATE THAT HOST WAS THE ACTUAL HOST OF THE TRAVEL PLAN
        if (travelPlan.user.toString() !== payload.host.toString()) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                "The specified host is not the host of this travel plan"
            );
        }

        // 8. CHECK FOR DUPLICATE REVIEW (one review per travel per reviewer)
        const existingReview = await Review.findOne({
            travelPlan: payload.travelPlan,
            reviewer: reviewerId,
        }).session(session);

        if (existingReview) {
            throw new AppError(
                httpStatus.CONFLICT,
                "You have already reviewed this travel plan. You can only give one review per travel"
            );
        }

        // 9. VALIDATE RATING
        if (!payload.rating || payload.rating < 1 || payload.rating > 5) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                "Rating must be between 1 and 5"
            );
        }

        // 10. VALIDATE COMMENT
        if (!payload.comment || payload.comment.trim().length === 0) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                "Comment is required"
            );
        }

        if (payload.comment.trim().length < 5) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                "Comment must be at least 5 characters long"
            );
        }

        // 11. CREATE THE REVIEW
        const review = await Review.create(
            [
                {
                    host: payload.host,
                    reviewer: reviewerId,
                    rating: payload.rating,
                    comment: payload.comment.trim(),
                    travelPlan: payload.travelPlan,
                },
            ],
            { session }
        );

        if (!review || review.length === 0) {
            throw new AppError(
                httpStatus.INTERNAL_SERVER_ERROR,
                "Failed to create review"
            );
        }

        const newReview = review[0];

        // 12. UPDATE HOST'S AVERAGE RATING
        await calculateAndUpdateAverageRating(payload.host.toString(), session);

        // 13. ADD REVIEW REFERENCES TO USER PROFILES
        await User.findByIdAndUpdate(
            reviewerId,
            { $addToSet: { reviewsWritten: newReview._id } },
            { session, new: true }
        );

        await User.findByIdAndUpdate(
            payload.host,
            { $addToSet: { reviewsReceived: newReview._id } },
            { session, new: true }
        );

        await session.commitTransaction();
        session.endSession();

        // Return populated review
        const populatedReview = await Review.findById(newReview._id)
            .populate("host", "name profileImage averageRating")
            .populate("reviewer", "name profileImage")
            .populate("travelPlan", "title destination");

        return populatedReview as IReview;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

/**
 * Get all reviews for a specific host with pagination and filtering
 */
const getReviewsForHost = async (hostId: string, query: Record<string, string>) => {
    // Validate host exists
    const host = await User.findById(hostId);
    if (!host) {
        throw new AppError(httpStatus.NOT_FOUND, "Host not found");
    }

    const queryBuilder = new QueryBuilder(
        Review.find({ host: hostId })
            .populate("reviewer", "name profileImage")
            .populate("travelPlan", "title destination startDate endDate"),
        query as Record<string, string>
    );

    const reviews = await queryBuilder
        .sort()
        .filter()
        .paginate()
        .fields()
        .build();

    const meta = await queryBuilder.getMeta();

    return { data: reviews, meta };
};

/**
 * Get all reviews written by a specific user (reviewer)
 */
const getReviewsWrittenByUser = async (
    reviewerId: string,
    query: Record<string, string>
) => {
    // Validate reviewer exists
    const reviewer = await User.findById(reviewerId);
    if (!reviewer) {
        throw new AppError(httpStatus.NOT_FOUND, "Reviewer not found");
    }

    const queryBuilder = new QueryBuilder(
        Review.find({ reviewer: reviewerId })
            .populate("host", "name profileImage averageRating")
            .populate("travelPlan", "title destination startDate endDate"),
        query as Record<string, string>
    );

    const reviews = await queryBuilder
        .sort()
        .filter()
        .paginate()
        .fields()
        .build();

    const meta = await queryBuilder.getMeta();

    return { data: reviews, meta };
};

/**
 * Get a specific review by ID
 */
const getReviewById = async (reviewId: string): Promise<IReview> => {
    const review = await Review.findById(reviewId)
        .populate("host", "name profileImage averageRating bio")
        .populate("reviewer", "name profileImage bio")
        .populate("travelPlan", "title description destination startDate endDate");

    if (!review) {
        throw new AppError(httpStatus.NOT_FOUND, "Review not found");
    }

    return review as IReview;
};

/**
 * Get all reviews across the platform (with pagination and sorting)
 */
const getAllReviews = async (query: Record<string, string>) => {
    const queryBuilder = new QueryBuilder(
        Review.find()
            .populate("host", "name profileImage averageRating")
            .populate("reviewer", "name profileImage")
            .populate("travelPlan", "title destination"),
        query as Record<string, string>
    );

    const reviews = await queryBuilder
        .sort()
        .filter()
        .paginate()
        .fields()
        .build();

    const meta = await queryBuilder.getMeta();

    return { data: reviews, meta };
};

/**
 * Get host statistics including average rating and review count
 */
const getHostReviewStatistics = async (hostId: string) => {
    const host = await User.findById(hostId);
    if (!host) {
        throw new AppError(httpStatus.NOT_FOUND, "Host not found");
    }

    const reviews = await Review.find({ host: hostId });
    const ratings = reviews.map((r) => r.rating);

    // Calculate statistics
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
        ? parseFloat((ratings.reduce((a, b) => a + b, 0) / totalReviews).toFixed(2))
        : 0;

    // Calculate rating distribution
    const ratingDistribution = {
        "5": reviews.filter((r) => r.rating === 5).length,
        "4": reviews.filter((r) => r.rating === 4).length,
        "3": reviews.filter((r) => r.rating === 3).length,
        "2": reviews.filter((r) => r.rating === 2).length,
        "1": reviews.filter((r) => r.rating === 1).length,
    };

    return {
        hostId,
        hostName: host.name,
        totalReviews,
        averageRating,
        ratingDistribution,
        hostProfile: {
            name: host.name,
            profileImage: host.profileImage,
            bio: host.bio,
        },
    };
};

/**
 * Check if a user has already reviewed a specific travel plan
 */
const checkIfUserHasReviewedTravel = async (
    reviewerId: string,
    travelPlanId: string
): Promise<boolean> => {
    const review = await Review.findOne({
        reviewer: reviewerId,
        travelPlan: travelPlanId,
    });

    return !!review;
};

/**
 * Get review details including reviewer status
 */
const getReviewDetails = async (
    reviewId: string,
    requestingUserId?: string
): Promise<{
    review: IReview;
    isOwnReview: boolean;
}> => {
    const review = await getReviewById(reviewId);

    const isOwnReview = requestingUserId
        ? review.reviewer._id.toString() === requestingUserId
        : false;

    return { review, isOwnReview };
};

/**
 * Get top-rated hosts (premium feature)
 */
const getTopRatedHosts = async (
    limit = 10,
    minReviews = 1
) => {
    const topHosts = await User.find({
        totalReviewsReceived: { $gte: minReviews },
    })
        .select("name profileImage averageRating totalReviewsReceived bio")
        .sort({ averageRating: -1, totalReviewsReceived: -1 })
        .limit(limit);

    return topHosts;
};

/**
 * Get average rating for all hosts (for analytics)
 */
const getPlatformRatingStats = async () => {
    const stats = await Review.aggregate([
        {
            $group: {
                _id: null,
                averageRating: { $avg: "$rating" },
                totalReviews: { $sum: 1 },
                maxRating: { $max: "$rating" },
                minRating: { $min: "$rating" },
            },
        },
    ]);

    if (stats.length === 0) {
        return {
            averageRating: 0,
            totalReviews: 0,
            maxRating: 0,
            minRating: 0,
        };
    }

    return {
        averageRating: parseFloat(stats[0].averageRating.toFixed(2)),
        totalReviews: stats[0].totalReviews,
        maxRating: stats[0].maxRating,
        minRating: stats[0].minRating,
    };
};


const validateReviewEligibility = async (
    reviewerId: string,
    hostId: string,
    travelPlanId: string
): Promise<{
    isEligible: boolean;
    reasons: string[];
}> => {
    const reasons: string[] = [];

    try {
        // Check if reviewer exists
        const reviewer = await User.findById(reviewerId);
        if (!reviewer) {
            reasons.push("Reviewer does not exist");
            return { isEligible: false, reasons };
        }

        // Check if host exists
        const host = await User.findById(hostId);
        if (!host) {
            reasons.push("Host does not exist");
            return { isEligible: false, reasons };
        }

        // Check self-review
        if (reviewerId === hostId) {
            reasons.push("Cannot review yourself");
            return { isEligible: false, reasons };
        }

        // Check if travel plan exists
        const travelPlan = await TravelPlan.findById(travelPlanId);
        if (!travelPlan) {
            reasons.push("Travel plan does not exist");
            return { isEligible: false, reasons };
        }

        // Check if travel is completed
        const currentDate = new Date();
        if (travelPlan.endDate > currentDate) {
            reasons.push(
                `Travel plan has not ended yet. End date: ${travelPlan.endDate.toISOString()}`
            );
            return { isEligible: false, reasons };
        }

        // Check if reviewer was accepted member
        const travelRequest = await TravelRequest.findOne({
            travelPlan: travelPlanId,
            requester: reviewerId,
            status: TravelRequestStatus.ACCEPTED,
        });

        if (!travelRequest) {
            reasons.push("You were not an accepted member of this travel plan");
            return { isEligible: false, reasons };
        }

        // Check if host is the actual host
        if (travelPlan.user.toString() !== hostId) {
            reasons.push("Specified user is not the host of this travel plan");
            return { isEligible: false, reasons };
        }

        // Check if already reviewed
        const existingReview = await Review.findOne({
            travelPlan: travelPlanId,
            reviewer: reviewerId,
        });

        if (existingReview) {
            reasons.push("You have already reviewed this travel plan");
            return { isEligible: false, reasons };
        }

        return { isEligible: true, reasons: [] };
    } catch {
        reasons.push("Error validating eligibility");
        return { isEligible: false, reasons };
    }
};

export const reviewServices = {
    createReview,
    getReviewsForHost,
    getReviewsWrittenByUser,
    getReviewById,
    getAllReviews,
    getHostReviewStatistics,
    checkIfUserHasReviewedTravel,
    getReviewDetails,
    getTopRatedHosts,
    getPlatformRatingStats,
    validateReviewEligibility,
    calculateAndUpdateAverageRating,
};
