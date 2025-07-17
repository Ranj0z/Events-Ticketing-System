ALTER TABLE "payment" DROP CONSTRAINT "payment_Event_id_events_EventID_fk";
--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_Event_id_RSVP_Event_id_fk" FOREIGN KEY ("Event_id") REFERENCES "public"."RSVP"("Event_id") ON DELETE cascade ON UPDATE no action;