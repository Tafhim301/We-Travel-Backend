import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { envVars } from "./env"; // your env config

cloudinary.config({
  cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
  api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET,
});

export { cloudinary, UploadApiResponse };
