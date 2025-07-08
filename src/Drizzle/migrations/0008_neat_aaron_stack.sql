CREATE TABLE "RSVP" (
	"RSVPID" serial PRIMARY KEY NOT NULL,
	"User_id" integer NOT NULL,
	"Event_id" integer,
	"RSVP_date" date NOT NULL,
	"return_date" date NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payment" RENAME COLUMN "EventID" TO "RSVP_id";--> statement-breakpoint
ALTER TABLE "payment" DROP CONSTRAINT "payment_EventID_events_EventID_fk";
--> statement-breakpoint
ALTER TABLE "RSVP" ADD CONSTRAINT "RSVP_User_id_user_UserID_fk" FOREIGN KEY ("User_id") REFERENCES "public"."user"("UserID") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "RSVP" ADD CONSTRAINT "RSVP_Event_id_events_EventID_fk" FOREIGN KEY ("Event_id") REFERENCES "public"."events"("EventID") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_RSVP_id_RSVP_RSVPID_fk" FOREIGN KEY ("RSVP_id") REFERENCES "public"."RSVP"("RSVPID") ON DELETE cascade ON UPDATE no action;