import { Router } from "express";
import { locationController } from "./location.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { createLocationValidation } from "./location.validation";
import { Role } from "../user/user.interface";




const router = Router();

router.get("/", locationController.getAllLocations );
router.get("/:id", locationController.getSingleLocation );
router.post("/create", checkAuth(Role.ADMIN), validateRequest(createLocationValidation),locationController.createLocations );

router.patch("/:id", checkAuth(Role.ADMIN), locationController.updatedLocation );

router.delete("/:id", checkAuth(Role.ADMIN), locationController.deletedLocation );


export const locationRoutes = router;
