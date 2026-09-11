CREATE TABLE "ticket_type" (
	"TicketTypeID" serial PRIMARY KEY NOT NULL,
	"Event_id" integer NOT NULL,
	"name" varchar(50) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"total_quantity" integer NOT NULL,
	"sold_quantity" integer DEFAULT 0 NOT NULL,
	"description" text,
	"date_created" date DEFAULT now() NOT NULL,
	"date_updated" date
);
--> statement-breakpoint
ALTER TABLE "ticket_type" ADD CONSTRAINT "ticket_type_Event_id_events_EventID_fk" FOREIGN KEY ("Event_id") REFERENCES "public"."events"("EventID") ON DELETE cascade ON UPDATE no action;