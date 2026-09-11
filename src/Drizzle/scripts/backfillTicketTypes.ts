// // Phase 2.5.4 — one-off backfill script (NOT a migration file).
// // Run manually once 2.5.2 has been pushed and 2.5.3's audit is clean:
// //   pnpm tsx src/Drizzle/scripts/backfillTicketTypes.ts
// //
// // Place this file at: src/Drizzle/scripts/backfillTicketTypes.ts
// // (imports below assume that location, matching seed.ts's "../db" / "../schema" pattern)
// //
// // Safe to re-run: every insert/update is guarded so a partial or failed run
// // can be resumed without creating duplicate TicketType rows or clobbering
// // RSVPs that were already backfilled.
// //
// // What it does, per existing event:
// //   1. Inserts a TicketTypeTable row named "Regular" using that event's own
// //      ticketsPrice / totalTickets / soldTickets.
// //   2. Sets RSVP.TicketTypeID for that event's RSVPs to the new row.
// // Then, across all RSVPs:
// //   3. Sets RSVP.PaymentID from the existing Payment.RSVPID link (reverse-populate).
// //      If an RSVP has more than one payment row (e.g. a failed attempt followed
// //      by a retry), the "Completed" one is preferred; otherwise the most recent
// //      by created_at is used, and the case is flagged for manual review.

// import db from "../db";
// import { EventsTable, TicketTypeTable, RSVPTable, PaymentTable } from "../schema";
// import { eq, and, isNull, desc } from "drizzle-orm";

// async function backfillTicketTypes() {
//   console.log("=== Phase 2.5.4 backfill: starting ===");

//   const events = await db.select().from(EventsTable);
//   console.log(`Found ${events.length} events to process.`);

//   let eventsProcessed = 0;
//   let ticketTypesCreated = 0;
//   let ticketTypesAlreadyPresent = 0;
//   let rsvpsLinkedToTicketType = 0;
//   let rsvpsLinkedToPayment = 0;
//   const ambiguousPaymentCases: { rsvpId: number; paymentIds: number[] }[] = [];

//   // --- Step 1 & 2: one "Regular" ticket type per event, link that event's RSVPs ---
//   for (const event of events) {
//     const existing = await db
//       .select()
//       .from(TicketTypeTable)
//       .where(
//         and(eq(TicketTypeTable.EventID, event.EventID), eq(TicketTypeTable.name, "Regular"))
//       )
//       .limit(1);

//     let ticketTypeId: number;

//     if (existing.length > 0) {
//       ticketTypeId = existing[0].TicketTypeID;
//       ticketTypesAlreadyPresent++;
//       console.log(
//         `Event ${event.EventID}: "Regular" ticket type already exists (id ${ticketTypeId}) — skipping insert.`
//       );
//     } else {
//       const [inserted] = await db
//         .insert(TicketTypeTable)
//         .values({
//           EventID: event.EventID,
//           name: "Regular",
//           price: event.ticketsPrice,
//           totalQuantity: event.totalTickets,
//           soldQuantity: event.soldTickets,
//         })
//         .returning();
//       ticketTypeId = inserted.TicketTypeID;
//       ticketTypesCreated++;
//       console.log(
//         `Event ${event.EventID}: created "Regular" ticket type (id ${ticketTypeId}) — price=${event.ticketsPrice}, total=${event.totalTickets}, sold=${event.soldTickets}`
//       );
//     }

//     const linked = await db
//       .update(RSVPTable)
//       .set({ TicketTypeID: ticketTypeId })
//       .where(and(eq(RSVPTable.EventID, event.EventID), isNull(RSVPTable.TicketTypeID)))
//       .returning({ RSVPID: RSVPTable.RSVPID });

//     rsvpsLinkedToTicketType += linked.length;
//     eventsProcessed++;
//   }

//   // --- Step 3: reverse-populate RSVP.PaymentID from Payment.RSVPID ---
//   console.log("\n=== Reverse-populating RSVP.PaymentID from Payment.RSVPID ===");

//   const unlinkedRsvps = await db
//     .select({ RSVPID: RSVPTable.RSVPID })
//     .from(RSVPTable)
//     .where(isNull(RSVPTable.PaymentID));

//   for (const rsvp of unlinkedRsvps) {
//     const payments = await db
//       .select()
//       .from(PaymentTable)
//       .where(eq(PaymentTable.RSVPID, rsvp.RSVPID))
//       .orderBy(desc(PaymentTable.created_at), desc(PaymentTable.PaymentID));

//     if (payments.length === 0) {
//       continue; // no payment was ever made for this RSVP — leave PaymentID null
//     }

//     const chosen = payments.find((p) => p.paymentStatus === "Completed") ?? payments[0];

//     if (payments.length > 1) {
//       ambiguousPaymentCases.push({
//         rsvpId: rsvp.RSVPID,
//         paymentIds: payments.map((p) => p.PaymentID),
//       });
//     }

//     await db
//       .update(RSVPTable)
//       .set({ PaymentID: chosen.PaymentID })
//       .where(eq(RSVPTable.RSVPID, rsvp.RSVPID));

//     rsvpsLinkedToPayment++;
//   }

//   // --- Summary ---
//   console.log("\n=== Backfill summary ===");
//   console.log(`Events processed:             ${eventsProcessed}`);
//   console.log(`Ticket types created:         ${ticketTypesCreated}`);
//   console.log(`Ticket types already present: ${ticketTypesAlreadyPresent}`);
//   console.log(`RSVPs linked to a ticket type: ${rsvpsLinkedToTicketType}`);
//   console.log(`RSVPs linked to a payment:     ${rsvpsLinkedToPayment}`);

//   if (ambiguousPaymentCases.length > 0) {
//     console.log(
//       `\n⚠ ${ambiguousPaymentCases.length} RSVP(s) had more than one payment row. Picked "Completed" if present, else most recent by date. Review manually:`
//     );
//     for (const c of ambiguousPaymentCases) {
//       console.log(`  RSVP ${c.rsvpId}: payments [${c.paymentIds.join(", ")}]`);
//     }
//   }

//   // --- Checkpoint verification ---
//   const stillNullTicketType = await db
//     .select({ RSVPID: RSVPTable.RSVPID })
//     .from(RSVPTable)
//     .where(isNull(RSVPTable.TicketTypeID));

//   if (stillNullTicketType.length > 0) {
//     console.log(
//       `\n❌ CHECKPOINT FAILED: ${stillNullTicketType.length} RSVP(s) still have a null TicketTypeID: ${stillNullTicketType
//         .map((r) => r.RSVPID)
//         .join(", ")}`
//     );
//   } else {
//     console.log("\n✅ CHECKPOINT PASSED: every RSVP has a non-null TicketTypeID.");
//   }

//   const missingPaymentLink = await db
//     .selectDistinct({ RSVPID: RSVPTable.RSVPID })
//     .from(RSVPTable)
//     .innerJoin(PaymentTable, eq(PaymentTable.RSVPID, RSVPTable.RSVPID))
//     .where(isNull(RSVPTable.PaymentID));

//   if (missingPaymentLink.length > 0) {
//     console.log(
//       `❌ CHECKPOINT FAILED: ${missingPaymentLink.length} RSVP(s) have a payment but no PaymentID set: ${missingPaymentLink
//         .map((r) => r.RSVPID)
//         .join(", ")}`
//     );
//   } else {
//     console.log("✅ CHECKPOINT PASSED: every RSVP with a payment has a non-null PaymentID.");
//   }

//   console.log("\n=== Phase 2.5.4 backfill: done ===");
// }

// backfillTicketTypes()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error("Backfill failed:", error);
//     process.exit(1);
//   });
