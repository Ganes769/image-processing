import type { Request, Response } from "express";
import { Readable } from "stream";
import { cloudinary } from "../config/cloudinary";
import { images } from "../schema/imageSchema";
import { db } from "../db/connection";

type RequestWithFile = Omit<Request, "file"> & {
  file?: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size?: number;
  };
  user?: { id: number };
};

export const uploadImage = async (req: RequestWithFile, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided." });
    }

    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
      process.env;

    if (
      !CLOUDINARY_CLOUD_NAME ||
      !CLOUDINARY_API_KEY ||
      !CLOUDINARY_API_SECRET
    ) {
      return res.status(500).json({
        message:
          "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
      });
    }

    const uploaded = await new Promise<{
      secure_url: string;
      public_id: string;
      bytes: number;
      width: number;
      height: number;
      format: string;
    }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "image-processing",
          resource_type: "image",
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error("No result from Cloudinary"));

          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            bytes: result.bytes,
            width: result.width,
            height: result.height,
            format: result.format,
          });
        },
      );

      Readable.from(req.file.buffer).pipe(stream);
    });

    const [saved] = await db
      .insert(images)
      .values({
        userId: req.user.id,
        publicId: uploaded.public_id,
        url: uploaded.secure_url,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        sizeBytes: uploaded.bytes,
        width: uploaded.width,
        height: uploaded.height,
      })
      .returning();

    return res.status(201).json({
      message: "Image uploaded successfully",
      image: saved,
      url: uploaded.secure_url,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to upload image." });
  }
};
