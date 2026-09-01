CREATE TYPE "public"."RSVPstatus" AS ENUM('Pending', 'Booked', 'Cancelled');--> statement-breakpoint
ALTER TABLE "RSVP" RENAME COLUMN "return_date" TO "StatusRSVP";