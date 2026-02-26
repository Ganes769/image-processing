import type { Request, Response } from "express";
import { getImageById } from "../utils/getImageById";
import sharp from "sharp";
import { pipeline } from "stream/promises";

type TransFormBody = {
  transformation?: {
    resize?: { width: number; heigth: number };
    crop?: { height: number; width: number; left: number; top: number };

    rotate: number;
    format: string;

    filters?: { grayscale?: boolean; sepia?: boolean };
  };
};
export const imageTrnsform = async (
  req: Request<{ id: string }, any, TransFormBody>,
  res: Response,
) => {
  try {
    const id = Number(req.params.id);
    const image = await getImageById(id);
    if (!image) {
      return res.status(404).json({ message: "image not found" });
    }

    const t = req.body.transformation;

    const upstream = await fetch(image.url);
    let trasnformer = sharp();

    if (!upstream.ok || !upstream.body) {
      return res.status(502).json({ message: "Failed to fetch image" });
    }
    if (t?.resize) {
      trasnformer = trasnformer.resize(t.resize.heigth, t.resize.width);
    }
    if (t?.crop) {
      trasnformer = trasnformer.extract({
        width: t.crop.width,
        height: t.crop.height,
        left: t.crop.left,
        top: t.crop.top,
      });
    }

    if (typeof t?.rotate === "number") {
      trasnformer = trasnformer.rotate(t.rotate);
    }

    if (t?.filters?.grayscale) {
      trasnformer = trasnformer.grayscale();
    }

    if (t?.filters?.sepia) {
      trasnformer = trasnformer.tint({ r: 112, g: 66, b: 20 });
    }
    switch (t?.format) {
      case "png":
        trasnformer = trasnformer.png();
        res.setHeader("Content-Type", "image/png");
        break;
      case "webp":
        trasnformer = trasnformer.webp({ quality: 80 });
        res.setHeader("Content-Type", "image/webp");
        break;
      case "avif":
        trasnformer = trasnformer.avif({ quality: 50 });
        res.setHeader("Content-Type", "image/avif");
        break;
      case "jpg":
      case "jpeg":
      default:
        trasnformer = trasnformer.jpeg({ quality: 80 });
        res.setHeader("Content-Type", "image/jpeg");
        break;
    }

    await pipeline(upstream.body as any, trasnformer, res);
    console.log("respone", res);
  } catch (error) {
    console.log(error);
  }
};
