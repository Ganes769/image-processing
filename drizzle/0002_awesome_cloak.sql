ALTER TABLE "images" ADD COLUMN "public_id" varchar(255);
--> statement-breakpoint
UPDATE "images" SET "public_id" = 'legacy/' || "id"::text WHERE "public_id" IS NULL;
--> statement-breakpoint
ALTER TABLE "images" ALTER COLUMN "public_id" SET NOT NULL;
