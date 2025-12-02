import { Router } from "express";
import { travelPlanController } from "./travelPlan.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { multerUpload } from "../../config/multer.confiq";
import { createTravelPlanSchema, updateTravelPlanSchema } from "./travelPlan.validation";
import { formDataParser } from "../../middlewares/formDataParser";

const router = Router();

router.post(
  "/",
  checkAuth(Role.USER,Role.ADMIN),
  multerUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "demoImages", maxCount: 10 },
  ]),
  formDataParser,
  validateRequest(createTravelPlanSchema),
  travelPlanController.createTravelPlan
);

router.get("/", travelPlanController.getTravelPlans);
router.get("/:id", travelPlanController.getTravelPlanById);

router.patch(
  "/:id",
  checkAuth(Role.USER,Role.ADMIN),
  multerUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "demoImages", maxCount: 10 },
  ]),
  

  validateRequest(updateTravelPlanSchema),
  travelPlanController.updateTravelPlan
);

router.delete("/:id", checkAuth(Role.USER), travelPlanController.deleteTravelPlan);

export const travelPlanRoutes = router;
