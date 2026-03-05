import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  bigint,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./userSchema";

export const images = pgTable(
  "images",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    fileName: text("file_name"),
    mimeType: text("mime_type").notNull(),
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
  publicId: varchar("public_id", { length: 255 }).notNull()
    width: integer("width"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    height: integer("height"),
    url: text("url").notNull(),
  },
  (t) => ({
    userIdIdx: uniqueIndex("images_user_id_id_unique").on(t.userId, t.id),
  }),
);
