ALTER TABLE "events" ADD COLUMN "HostID" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "Eimage_public_id" varchar;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "image_public_id" varchar;--> statement-breakpoint
ALTER TABLE "venue" ADD COLUMN "Vimage_public_id" varchar;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_HostID_user_UserID_fk" FOREIGN KEY ("HostID") REFERENCES "public"."user"("UserID") ON DELETE no action ON UPDATE no action;