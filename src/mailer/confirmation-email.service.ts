// §6 — Booking confirmation email service.
// Sends one email per attendee (CartAttendee.email) after a booking is confirmed,
// for both free tickets (sent immediately in reservation.service) and paid tickets
// (sent from the gateway webhook success path in payment.service).
//
// The real event date/time are always included in the email regardless of dateTBD —
// this is where the "coming soon" surprise gets revealed to the booker.

import { sendEmail } from "./mailer";
import { TSEvents, TSRSVP, TSTicketType } from "../Drizzle/schema";

export type ConfirmationEmailInput = {
  rsvps: TSRSVP[];
  event: TSEvents;
  ticketTypeById: Map<number, TSTicketType>;
};

export const sendConfirmationEmailService = async ({
  rsvps,
  event,
  ticketTypeById,
}: ConfirmationEmailInput): Promise<void> => {
  // Group RSVPs by attendee email so one email covers multiple tickets for the same address.
  const byEmail = new Map<string, TSRSVP[]>();
  for (const rsvp of rsvps) {
    const email = rsvp.email;
    if (!email) continue;
    if (!byEmail.has(email)) byEmail.set(email, []);
    byEmail.get(email)!.push(rsvp);
  }

  const eventDate = event.date; // always the real date regardless of dateTBD
  const eventTime = event.time;

  for (const [email, attendeeRsvps] of byEmail) {
    const firstName = attendeeRsvps[0]?.firstName ?? "there";
    const ticketLines = attendeeRsvps
      .map((r) => {
        const tier = ticketTypeById.get(r.TicketTypeID);
        const tierName = tier?.name ?? "Ticket";
        const amount = Number(r.totalAmount) === 0 ? "Free" : `KES ${Number(r.totalAmount).toFixed(2)}`;
        return `• ${tierName} — ${amount} (Check-in code: ${r.checkInCode})`;
      })
      .join("\n");

    const subject = `Your booking for ${event.title} is confirmed!`;

    const text = [
      `Hi ${firstName},`,
      "",
      `You're booked for ${event.title}!`,
      "",
      `Date: ${eventDate}`,
      `Time: ${eventTime}`,
      "",
      "Your tickets:",
      ticketLines,
      "",
      "Please bring your check-in code(s) to the event.",
      "",
      "See you there!",
    ].join("\n");

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You're booked for <strong>${event.title}</strong>! 🎉</h2>
        <p>Hi ${firstName},</p>
        <p>Your booking is confirmed. Here are your details:</p>
        <table style="border-collapse: collapse; width: 100%;">
          <tr>
            <td style="padding: 8px; font-weight: bold;">Date</td>
            <td style="padding: 8px;">${eventDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Time</td>
            <td style="padding: 8px;">${eventTime}</td>
          </tr>
        </table>
        <h3>Your tickets</h3>
        <ul>
          ${attendeeRsvps
            .map((r) => {
              const tier = ticketTypeById.get(r.TicketTypeID);
              const tierName = tier?.name ?? "Ticket";
              const amount = Number(r.totalAmount) === 0 ? "Free" : `KES ${Number(r.totalAmount).toFixed(2)}`;
              return `<li><strong>${tierName}</strong> — ${amount}<br/>Check-in code: <code>${r.checkInCode}</code></li>`;
            })
            .join("")}
        </ul>
        <p>Please bring your check-in code(s) to the event. See you there!</p>
      </div>
    `;

    await sendEmail(email, subject, text, html);
  }
};