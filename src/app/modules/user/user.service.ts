import mongoose from "mongoose";
import { envVars } from "../../config/env";
import AppError from "../../errorHandlers/appError";
import { QueryBuilder } from "../../utils/queryBuilder";
import { userSearchableFields } from "./user.constant";
import { IUser, Role } from "./user.interface";
import { User } from "./user.model";
import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import { createUserTokens } from "../../utils/userTokens";
import { uploadBufferCloudinary } from "../../utils/cloudinaryUploader";
import { TravelPlan } from "../TravelPlan/travelPlan.model";




const createUser = async (payload: { body: Partial<IUser> }, file?: Express.Multer.File) => {
  const { name, email, password, role, ...rest } = payload.body;



  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const doesUserExist = await User.findOne({ email }).session(session);
    if (doesUserExist) {
      throw new AppError(httpStatus.BAD_REQUEST, "User already exists");
    }

    const hashedPassword = await bcryptjs.hash(
      password as string,
      envVars.BCRYPT_SALT_ROUND
    );

    
    let profileImage = undefined;
    if (file) {
      const result = await uploadBufferCloudinary(file.buffer, file.originalname, "profiles");
      profileImage = { url: result?.secure_url, public_id: result?.public_id };
    }

    const user = await User.create(
      [
        {
          name,
          email,
          password: hashedPassword,
          role: role,
          profileImage, 
          ...rest,
        },
      ],
      { session }
    );

    await user[0].save({ session });

    await session.commitTransaction();
    session.endSession();

    const {accessToken,refreshToken} = createUserTokens(user[0]);
    return { user: user[0], accessToken: accessToken, refreshToken: refreshToken};
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};


const getAllUsers = async (query: Record<string, unknown>) => {
  const queryBuilder = new QueryBuilder(
    User.find({ role: Role.USER }),
    query as Record<string, string>
  );

  const users = await queryBuilder
    .search(userSearchableFields)
    .filter()
    .fields()
    .sort()
    .paginate();

  const [data, meta] = await Promise.all([users.build(), queryBuilder.getMeta()]);

  return { meta: meta, data: data };
};


const getMe = async (userId: string) => {
  const user = await User.findById(userId).populate("");
  if (!user) {
    throw new AppError(404, "User Not Found");
  }
  return user;
};


const updateProfile = async (
  userId: string,
  payload: Partial<IUser>,
  file?: Express.Multer.File
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, "User Not Found");
  }


  if (payload.password) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You can't change password from update profile. Use /change-password route."
    );
  }


  if (file) {
    const result = await uploadBufferCloudinary(file.buffer, file.originalname, "profiles");
    payload.profileImage = {
      url: result?.secure_url,
      public_id: result?.public_id,
    };
  }

  const updatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  return updatedUser;
};


const changePassword = async (userId: string, oldPass: string, newPass: string) => {
  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new AppError(404, "User Not Found");
  }

  const isCorrect = await bcryptjs.compare(oldPass, user.password);
  if (!isCorrect) {
    throw new AppError(401, "Old password is incorrect");
  }

  const hashedNewPass = await bcryptjs.hash(
    newPass,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  user.password = hashedNewPass;
  await user.save();
  return { message: "Password updated successfully" };
};


const checkPassword = async (userId: string, password: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, "User Not Found");
  }

  const matchedPassword = await bcryptjs.compare(
    password,
    user?.password as string
  );
  if (!matchedPassword) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Password doesn't Match");
  }

  return user;
};



export const getSingleUser = async (userId: string) => {


  const user = await User.findById(userId)
    .populate({
      path: "reviewsReceived",
      populate: { path: "reviewer" },
    })
    .populate("subscription")
    .populate("interests");

  if (!user) {
    throw new AppError(404, "User Not Found");
  }
  const travelPlans = await TravelPlan.find({
    user: userId,
    endDate: { $gte: new Date() },
  }).populate("user");

  return {
    user,
    travelPlans,
  };
};

export const userServices = {
  createUser,
  getAllUsers,
  getMe,
  checkPassword,
  updateProfile,
  changePassword,  
  getSingleUser
};
