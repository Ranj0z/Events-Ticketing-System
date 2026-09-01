ALTER TABLE "payment" ALTER COLUMN "payment_date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "payment" ADD COLUMN "payment_create" date NOT NULL;--> statement-breakpoint
ALTER TABLE "payment" ADD COLUMN "payment_update" date;