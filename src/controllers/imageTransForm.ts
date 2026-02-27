import type { Request, Response } from "express";
import sharp from "sharp";
import { getImageById } from "../utils/getImageById";
import { cloudinary } from "../config/cloudinary";
import { db } from "../db/connection";
import { transformedImages } from "../schema/transformation";

type TransFormBody = {
  transformation?: {
    resize?: { width: number; heigth: number }; // keep your typo if client sends "heigth"
    crop?: { height: number; width: number; left: number; top: number };
    rotate?: number;
    format?: string;
    filters?: { grayscale?: boolean; sepia?: boolean };
  };
};

function uploadToCloudinary(
  readable: NodeJS.ReadableStream,
  opts: Record<string, unknown>,
) {
  return new Promise<any>((resolve, reject) => {
    const uploadStream = (cloudinary.uploader.upload_stream as any)(
      opts,
      (err: Error | null, result: any) => {
        if (err) return reject(err);
        resolve(result);
      },
    );
    readable.pipe(uploadStream);
  });
}

export const imageTrnsform = async (
  req: Request<{ id: string }, any, TransFormBody>,
  res: Response,
) => {
  try {
    const id = Number(req.params.id);
    const user = (req as Request & { user?: Record<string, unknown> }).user;
    const userId = user?.id as number | undefined;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const image = await getImageById(id);
    if (!image) return res.status(404).json({ message: "image not found" });

    const t = (req.body ?? {}).transformation;

    const upstream = await fetch(image.url);
    if (!upstream.ok || !upstream.body) {
      return res.status(502).json({ message: "Failed to fetch image" });
    }

    let transformer = sharp();

    if (t?.resize) {
      transformer = transformer.resize(t.resize.width, t.resize.heigth);
    }

    if (t?.crop) {
      transformer = transformer.extract({
        width: t.crop.width,
        height: t.crop.height,
        left: t.crop.left,
        top: t.crop.top,
      });
    }

    if (typeof t?.rotate === "number") {
      transformer = transformer.rotate(t.rotate);
    }

    if (t?.filters?.grayscale) {
      transformer = transformer.grayscale();
    }

    if (t?.filters?.sepia) {
      transformer = transformer.tint({ r: 112, g: 66, b: 20 });
    }

    const format = (t?.format ?? "jpeg").toLowerCase();
    switch (format) {
      case "png":
        transformer = transformer.png();
        break;
      case "webp":
        transformer = transformer.webp({ quality: 80 });
        break;
      case "avif":
        transformer = transformer.avif({ quality: 50 });
        break;
      case "jpg":
      case "jpeg":
      default:
        transformer = transformer.jpeg({ quality: 80 });
        break;
    }
    const { Readable } = await import("stream");
    const nodeReadable = Readable.fromWeb(upstream.body as any);
    nodeReadable.pipe(transformer);
    const result = await uploadToCloudinary(transformer, {
      folder: "transformed-images",
      resource_type: "image",
    });

    const [saved] = await db
      .insert(transformedImages)
      .values({
        imageId: id,
        userId: userId,
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format ?? null,
        width: result.width ?? null,
        height: result.height ?? null,
        sizeBytes: result.bytes ?? null,
        transformations: t ? JSON.stringify(t) : null,
      })
      .returning();

    return res.status(200).json({
      id: saved.id,
      url: saved.url,
      public_id: saved.publicId,
      format: saved.format,
      bytes: saved.sizeBytes,
      width: saved.width,
      height: saved.height,
      imageId: saved.imageId,
      userId: saved.userId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
