ALTER TABLE "events" ADD COLUMN "Eimage_url" varchar;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "image_url" varchar;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "date_created" date;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "date_updated" date;--> statement-breakpoint
ALTER TABLE "venue" ADD COLUMN "Vimage_url" varchar;