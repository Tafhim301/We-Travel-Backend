import { UploadApiResponse } from "cloudinary";
import stream from "stream";
import AppError from "../errorHandlers/appError";
import { cloudinary } from "../config/cloudinary.confiq";

export const uploadBufferCloudinary = async (
  buffer: Buffer,
  fileName: string,
  folder = "general"
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const public_id = `${folder}/${fileName}-${Date.now()}`;

    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);

    cloudinary.uploader.upload_stream(
      {
        resource_type: "auto", // auto detects images, videos, pdfs, etc.
        public_id,
        folder,
      },
      (error, result) => {
        if (error) return reject(new AppError(500, `Cloudinary upload error: ${error.message}`));
        if (!result) return reject(new AppError(500, "Cloudinary upload returned no result"));
        resolve(result);
      }
    ).end(buffer);
  });
};
