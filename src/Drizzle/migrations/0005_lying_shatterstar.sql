ALTER TABLE "ticket" ALTER COLUMN "payment_date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "payment_update" date;