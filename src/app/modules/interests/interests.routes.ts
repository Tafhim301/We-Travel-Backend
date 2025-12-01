import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { interestController } from "./intersts.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createInterestValidation } from "./interest.validation";



const router = Router();


router.get("/", interestController.getAllInterests );
router.get("/:id", interestController.getSingleInterest );  


router.post("/create", checkAuth(Role.ADMIN), validateRequest(createInterestValidation),interestController.createInterests );

router.patch("/:id", checkAuth(Role.ADMIN), interestController.updatedInterest );

router.delete("/:id", checkAuth(Role.ADMIN), interestController.deletedInterest );



export const interestRoutes = router;