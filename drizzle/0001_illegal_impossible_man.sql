CREATE TABLE "transformed_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"image_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"url" text NOT NULL,
	"public_id" text NOT NULL,
	"format" text,
	"width" integer,
	"height" integer,
	"size_bytes" integer,
	"transformations" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "transformed_images" ADD CONSTRAINT "transformed_images_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transformed_images" ADD CONSTRAINT "transformed_images_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;