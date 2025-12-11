import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import { userController } from "./user.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";
import { multerUpload } from "../../config/multer.confiq";
import { formDataParser } from "../../middlewares/formDataParser";

const router = Router();

router.post(
  "/register",
  multerUpload.single("profileImage"), 
  formDataParser,
  validateRequest(createUserZodSchema), 
  userController.createUser
);
router.get(
  "/all-users",
  checkAuth(Role.ADMIN),

  userController.getAllUsers
);
router.get(
  "/me",
  checkAuth(...Object.values(Role)),

  userController.getMe
);
router.get(
  "/:id",


  userController.getSingleUser
);
router.patch(
  "/update",
  checkAuth(...Object.values(Role)),
  multerUpload.single("profileImage"), 
  formDataParser,
  validateRequest(updateUserZodSchema),
  userController.updateProfile
);

router.post(
  "/validate-password",
  checkAuth(...Object.values(Role)),

  userController.checkPassword
);

export const userRoutes = router;
