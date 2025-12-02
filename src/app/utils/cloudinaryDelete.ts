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


export const extractPublicIdFromUrl = (url: string): string => {
  try {
    // Example URL:
    // https://res.cloudinary.com/dczusykb2/image/upload/v1234567890/travel-plans/demos/example-image.jpg

    const urlWithoutParams = url.split("?")[0]; // remove URL params if any
    const parts = urlWithoutParams.split("/upload/")[1];

    if (!parts) throw new Error("Invalid Cloudinary URL");

    const fullPath = parts;

    const publicId = fullPath.replace(/\.[^/.]+$/, "");

    return publicId;
  } catch (err: any) {
    throw new AppError(400, `Cannot extract publicId from URL: ${err.message}`);
  }
};

export const deleteFromCloudinaryByUrl = async (url: string): Promise<void> => {
  try {
    const publicId = extractPublicIdFromUrl(url);
    await deleteFromCloudinary(publicId);
  } catch (error: any) {
    throw new AppError(500, `Cloudinary deleteByUrl error: ${error.message}`);
  }
};
