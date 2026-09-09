ALTER TABLE "payment" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "payment" ALTER COLUMN "status" SET DEFAULT 'Pending'::text;--> statement-breakpoint
DROP TYPE "public"."Paymentstatus";--> statement-breakpoint
CREATE TYPE "public"."Paymentstatus" AS ENUM('Pending', 'Completed', 'Failed');--> statement-breakpoint
ALTER TABLE "payment" ALTER COLUMN "status" SET DEFAULT 'Pending'::"public"."Paymentstatus";--> statement-breakpoint
ALTER TABLE "payment" ALTER COLUMN "status" SET DATA TYPE "public"."Paymentstatus" USING "status"::"public"."Paymentstatus";--> statement-breakpoint
ALTER TABLE "payment" ALTER COLUMN "payment_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "payment" ALTER COLUMN "payment_method" SET DEFAULT 'M-Pesa';--> statement-breakpoint
ALTER TABLE "payment" ALTER COLUMN "transaction_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "payment" ALTER COLUMN "payment_create" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "RSVP" ALTER COLUMN "total_amount" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "payment" ADD COLUMN "gateway_reference" varchar(100);--> statement-breakpoint
ALTER TABLE "payment" DROP COLUMN "balance";