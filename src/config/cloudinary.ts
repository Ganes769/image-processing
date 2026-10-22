import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

export function getCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
    api_key: process.env.CLOUDINARY_API_KEY?.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
  });
  return cloudinary;
}

export { cloudinary };
