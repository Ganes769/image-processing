import type { Request, Response } from "express";
import { Readable } from "stream";
import { cloudinary } from "../config/cloudinary";

interface RequestWithFile extends Request {
  file?: { buffer: Buffer; originalname: string; mimetype: string };
}

export const uploadImage = async (req: RequestWithFile, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided." });
    }

    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      return res.status(500).json({
        message: "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
      });
    }

    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "image-processing",
          resource_type: "image",
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error("No result from Cloudinary"));
          resolve({ secure_url: result.secure_url, public_id: result.public_id });
        }
      );
      Readable.from(req.file!.buffer).pipe(stream);
    });

    return res.status(201).json({
      message: "Image uploaded successfully",
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to upload image." });
  }
};
