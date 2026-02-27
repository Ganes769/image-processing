import type { Request, Response } from "express";
import { eq, desc, count } from "drizzle-orm";
import { db } from "../db/connection";
import { transformedImages } from "../schema/transformation";

export const getTransformedImagesByImageId = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const imageId = Number(req.params.id);
    if (isNaN(imageId)) {
      return res.status(400).json({ message: "Invalid image id" });
    }

    const results = await db
      .select()
      .from(transformedImages)
      .where(eq(transformedImages.imageId, imageId))
      .orderBy(desc(transformedImages.createdAt));

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "No transformed images found for this image id" });
    }

    return res.status(200).json({ data: results });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAllTransformedImages = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) ?? "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt((req.query.limit as string) ?? "10", 10)),
    );
    const offset = (page - 1) * limit;

    const results = await db
      .select()
      .from(transformedImages)
      .orderBy(desc(transformedImages.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ total }] = await db
      .select({ total: count() })
      .from(transformedImages);


    return res.status(200).json({
      data: results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
