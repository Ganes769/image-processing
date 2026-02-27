import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./userSchema";
import { images } from "./imageSchema";

export const transformedImages = pgTable("transformed_images", {
  id: serial("id").primaryKey(),
  imageId: integer("image_id")
    .notNull()
    .references(() => images.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  publicId: text("public_id").notNull(),
  format: text("format"),
  width: integer("width"),
  height: integer("height"),
  sizeBytes: integer("size_bytes"),
  transformations: text("transformations"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
