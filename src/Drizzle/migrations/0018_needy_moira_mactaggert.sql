ALTER TABLE "events" ALTER COLUMN "sold_tickets" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "payment" ALTER COLUMN "Event_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "RSVP" ALTER COLUMN "User_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "RSVP" ALTER COLUMN "Event_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "RSVP" ADD COLUMN "first_name" varchar(50);--> statement-breakpoint
ALTER TABLE "RSVP" ADD COLUMN "last_name" varchar(50);--> statement-breakpoint
ALTER TABLE "RSVP" ADD COLUMN "email" varchar(100);--> statement-breakpoint
ALTER TABLE "RSVP" ADD COLUMN "phone_number" text;--> statement-breakpoint
ALTER TABLE "RSVP" ADD COLUMN "paid" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "reset_token" varchar(64);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "reset_token_expiry" timestamp;--> statement-breakpoint
ALTER TABLE "RSVP" ADD CONSTRAINT "rsvp_user_or_guest" CHECK ("RSVP"."User_id" IS NOT NULL OR "RSVP"."email" IS NOT NULL);