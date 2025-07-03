ALTER TABLE "ticket" RENAME COLUMN "PaymentID" TO "TicketID";--> statement-breakpoint
ALTER TABLE "ticket" RENAME COLUMN "payment_date" TO "created_date";--> statement-breakpoint
ALTER TABLE "ticket" RENAME COLUMN "payment_update" TO "updated_date";