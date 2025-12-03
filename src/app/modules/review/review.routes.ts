import { Router } from 'express';
import { checkAuth } from '../../middlewares/checkAuth';
import { reviewControllers} from './review.controller';
import { Role } from '../user/user.interface';
  
  const router = Router();
  

  router.get('/', reviewControllers.getAllReviews);
  router.get('/host/:hostId', reviewControllers.getReviewsForHost);
  router.get('/written/:reviewerId', reviewControllers.getReviewsWrittenByUser);
  router.get('/single/:reviewId', reviewControllers.getReviewById);
  router.get('/stats/host/:hostId', reviewControllers.getHostReviewStatistics);
  router.get('/stats/platform', reviewControllers.getPlatformRatingStats);
  router.get('/top-hosts', reviewControllers.getTopRatedHosts);
 

  router.post('/', checkAuth(...Object.values(Role)), reviewControllers.createReview);
  router.get('/check/:travelPlanId', checkAuth(...Object.values(Role)), reviewControllers.checkIfUserHasReviewedTravel);
  router.get('/validate-eligibility', checkAuth(...Object.values(Role)), reviewControllers.validateReviewEligibility);
  
export const reviewRoutes = router;
 
