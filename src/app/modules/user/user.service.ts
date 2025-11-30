import mongoose from "mongoose";
import { envVars } from "../../config/env";
import AppError from "../../errorHandlers/appError";
import { QueryBuilder } from "../../utils/queryBuilder";
import { userSearchableFields } from "./user.constant";
import {  IUser, Role } from "./user.interface";
import { User } from "./user.model";
import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import { createUserTokens } from "../../utils/userTokens";

const createUser = async (payload: Partial<IUser>) => {
  const { name, email, password, role, ...rest } = payload;



  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const doesUserExist = await User.findOne({ email }).session(session);
    if (doesUserExist) {
      throw new AppError(httpStatus.BAD_REQUEST, "User already exists");
    }



    const hashedPassword = await bcryptjs.hash(
      password as string,
      Number(envVars.BCRYPT_SALT_ROUND)
    );

    const user = await User.create(
      [
        {
          name,
          email,
          password: hashedPassword,
          role: role,

          ...rest,
        },
      ],
      { session }
    );

    await user[0].save({ session });

    await session.commitTransaction();
    session.endSession();

    const accessToken = createUserTokens(user[0]);

    return { user: user[0], accessToken: accessToken };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getAllUsers = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(User.find({ role: Role.USER }).populate("wallet"), query);

  const users = await queryBuilder
    .search(userSearchableFields)
    .filter()
    .fields()
    .sort()
    .paginate();

  const [data, meta] = await Promise.all([
    users.build(),
    queryBuilder.getMeta(),
  ]);

  return { meta: meta, data: data };
};
const getMe = async (userId: string) => {
  const user = await User.findById(userId).populate("");
  if (!user) {
    throw new AppError(404, "User Not Found");
  }

  return user;
};
const updateProfile = async (userId: string, payload: Partial<IUser>) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, "User Not Found");
  }

  if (payload.password) {
    const hashedPassword = await bcryptjs.hash(
      payload.password as string,
      Number(envVars.BCRYPT_SALT_ROUND)
    );

    payload.password = hashedPassword;
  }

  const updatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  return updatedUser;
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

export const userServices = {
  createUser,
  getAllUsers,
  getMe,
  checkPassword,
  updateProfile,
};
