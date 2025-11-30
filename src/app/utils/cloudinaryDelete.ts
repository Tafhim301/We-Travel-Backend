/* eslint-disable @typescript-eslint/no-explicit-any */

import { cloudinary } from "../config/cloudinary.confiq";
import AppError from "../errorHandlers/appError";


export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result !== "ok" && result.result !== "not found") {
      throw new AppError(500, `Cloudinary deletion failed: ${result.result}`);
    }
  } catch (error: any) {
    throw new AppError(500, `Cloudinary deletion error: ${error.message}`);
  }
};
