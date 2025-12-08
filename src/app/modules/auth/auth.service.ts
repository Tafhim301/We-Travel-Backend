import AppError from "../../errorHandlers/appError";
import { validatePassword } from "../../utils/validatePasswordandSetCookie";
import { IUser } from "../user/user.interface";
import httpStatus from "http-status-codes";

const login = async (payload: Partial<IUser>) => {
  const { email, password } = payload;
  if (!email || !password) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Password and Email both are required for login"
    );
  }
  const result = await validatePassword(email, password);

  const { user } = result;
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  if (user && !user?.isActive) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your account is inactive. Please contact support."
    );
  }

  return {
    user: result.user,
 
     accessToken : result.accessToken,
    refreshToken : result.refreshToken
  
  };
};

export const authServices = {
  login,
};
