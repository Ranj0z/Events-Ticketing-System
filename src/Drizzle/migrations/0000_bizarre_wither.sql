CREATE TYPE "public"."Category" AS ENUM('Tech', 'Data Science', 'Web Dev');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('Pending', 'In Progress', 'Closed');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'host', 'user');--> statement-breakpoint
CREATE TABLE "payment" (
	"PaymentID" serial PRIMARY KEY NOT NULL,
	"EventID" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"Category" "status" DEFAULT 'Pending',
	"payment_date" date,
	"payment_method" varchar(50) NOT NULL,
	"transaction_id" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"EventID" serial PRIMARY KEY NOT NULL,
	"title" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"VenueID" integer NOT NULL,
	"Category" "Category" DEFAULT 'Tech',
	"event_date" date NOT NULL,
	"time" varchar(50) NOT NULL,
	"tickets_price" numeric(10, 2) NOT NULL,
	"total_tickets" integer NOT NULL,
	"sold_tickets" integer NOT NULL,
	"date_updated" date NOT NULL,
	"date_created" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"UserID" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(50) NOT NULL,
	"last_name" varchar(50) NOT NULL,
	"email" varchar(100) NOT NULL,
	"phone_number" text NOT NULL,
	"address" varchar(255) NOT NULL,
	"password" varchar NOT NULL,
	"role" "role" DEFAULT 'user',
	"is_verified" boolean DEFAULT false,
	"verification_code" varchar(10),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "venue" (
	"VenueID" serial PRIMARY KEY NOT NULL,
	"venue_name" varchar(100) NOT NULL,
	"address" varchar(255) NOT NULL,
	"capacity" integer,
	"created_at" date
);
--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_EventID_events_EventID_fk" FOREIGN KEY ("EventID") REFERENCES "public"."events"("EventID") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_VenueID_venue_VenueID_fk" FOREIGN KEY ("VenueID") REFERENCES "public"."venue"("VenueID") ON DELETE cascade ON UPDATE no action;