CREATE TYPE "public"."Paymentstatus" AS ENUM('Pending', 'In Progress', 'Completed');--> statement-breakpoint
ALTER TABLE "payment" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "payment" ALTER COLUMN "status" SET DATA TYPE "public"."Paymentstatus" USING "status"::text::"public"."Paymentstatus";--> statement-breakpoint
ALTER TABLE "payment" ALTER COLUMN "status" SET DEFAULT 'Pending';