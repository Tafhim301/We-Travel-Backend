import { Router } from "express";
import { travelRequestController } from "./travelRequest.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();


router.get(
  "/",  

    checkAuth(Role.USER, Role.ADMIN),
    travelRequestController.getAllTravelRequest
);


router.get(
  "/:id",  

    travelRequestController.getSingleTravelRequest
);


router.post(
  "/",
  checkAuth(Role.USER),
  travelRequestController.createTravelRequest
);


router.patch(
  "/approve/:id",
  checkAuth(Role.USER, Role.ADMIN),
  travelRequestController.approveTravelRequest
);


router.patch(
  "/reject/:id",
  checkAuth(Role.USER, Role.ADMIN),
  travelRequestController.rejectTravelRequest
);


router.delete(
  "/:id",
  checkAuth(Role.USER, Role.ADMIN),
  travelRequestController.deleteTravelRequest
);

export const travelRequestRoutes = router;
