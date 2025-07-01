CREATE TABLE "ticket" (
	"PaymentID" serial PRIMARY KEY NOT NULL,
	"UserID" integer NOT NULL,
	"subject" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"Category" "status" DEFAULT 'Pending',
	"payment_date" date
);
--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_UserID_user_UserID_fk" FOREIGN KEY ("UserID") REFERENCES "public"."user"("UserID") ON DELETE cascade ON UPDATE no action;