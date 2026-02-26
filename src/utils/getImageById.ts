import { db } from "../db/connection";
import { images } from "../schema/imageSchema";
import { eq } from "drizzle-orm";
export const getImageById = async (id: number | string) => {
  const result = await db
    .select()
    .from(images)
    .where(eq(images.id, id as any))
    .limit(1);
  return result[0] ?? null;
};
