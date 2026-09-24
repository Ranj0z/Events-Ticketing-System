import { eq, and } from "drizzle-orm";
import db from "../../Drizzle/db";
import { EventsTable, TicketTypeTable, TITicketType } from "../../Drizzle/schema";

// §2 — derived effective status. Never stored; computed at read time.
// "suspended" = host manually pulled it. "expired" = saleEndsAt passed.
// "active" = neither. Public pages filter on effectiveStatus === "active";
// admin views get all three so they can tell the difference.
export const computeEffectiveStatus = (
  status: "active" | "suspended",
  saleEndsAt: Date | null | undefined
): "active" | "suspended" | "expired" => {
  if (status === "suspended") return "suspended";
  if (saleEndsAt !== null && saleEndsAt !== undefined && saleEndsAt <= new Date()) return "expired";
  return "active";
};

// Get all Ticket Type tiers for a given Event, each enriched with effectiveStatus.
// Used both for displaying an event's tiers and for RSVP cart-building.
export const getTicketTypesByEventIdService = async (EventID: number) => {
  const ticketTypes = await db.query.TicketTypeTable.findMany({
    where: eq(TicketTypeTable.EventID, EventID),
  });
  return ticketTypes.map((t) => ({
    ...t,
    effectiveStatus: computeEffectiveStatus(t.status, t.saleEndsAt),
  }));
};

// Resolves the HostID that owns a ticket type, via its parent event. Used by the
// requireOwnerOrAdmin auth middleware on the create/update routes, since ownership
// isn't a direct field on ticket_type.
export const getTicketTypeOwnerHostIdService = async (ticketTypeId: number): Promise<number | null> => {
  const ticketType = await db.query.TicketTypeTable.findFirst({
    where: eq(TicketTypeTable.TicketTypeID, ticketTypeId),
    columns: { EventID: true },
  });
  if (!ticketType) return null;

  const event = await db.query.EventsTable.findFirst({
    where: eq(EventsTable.EventID, ticketType.EventID),
    columns: { HostID: true },
  });
  return event?.HostID ?? null;
};

// Recomputes the parent event's ticketsPrice (min price across active tiers) and
// totalTickets (sum of totalQuantity across active tiers). Suspended and expired tiers
// count toward neither — they're effectively pulled from public sale.
const recomputeEventTotalsService = async (EventID: number) => {
  const allTiers = await db.query.TicketTypeTable.findMany({
    where: eq(TicketTypeTable.EventID, EventID),
    columns: { price: true, totalQuantity: true, status: true, saleEndsAt: true },
  });

  // §2 — exclude anything whose effectiveStatus !== "active"
  const activeTiers = allTiers.filter(
    (t) => computeEffectiveStatus(t.status, t.saleEndsAt) === "active"
  );

  const ticketsPrice = activeTiers.length > 0
    ? Math.min(...activeTiers.map((t) => Number(t.price))).toFixed(2)
    : "0.00";
  const totalTickets = activeTiers.reduce((sum, t) => sum + t.totalQuantity, 0);

  await db.update(EventsTable)
    .set({ ticketsPrice, totalTickets })
    .where(eq(EventsTable.EventID, EventID));
};

export type CreateTicketTypeInput = {
  name: string;
  type?: "individual" | "group";
  groupSize?: number | null;
  price: number;
  totalQuantity: number;
  description?: string;
  // §3 — optional early-bird cutoff (ISO datetime string or null)
  saleEndsAt?: string | null;
};

// Creates a new ticket-type tier for an event (status: "active" by default), then
// recomputes the parent event's ticketsPrice/totalTickets.
export const createTicketTypeService = async (EventID: number, data: CreateTicketTypeInput) => {
  const [created] = await db.insert(TicketTypeTable).values({
    EventID,
    name: data.name,
    type: data.type ?? "individual",
    groupSize: data.groupSize ?? null,
    price: data.price.toFixed(2),
    totalQuantity: data.totalQuantity,
    description: data.description,
    saleEndsAt: data.saleEndsAt ? new Date(data.saleEndsAt) : null,
  } as TITicketType).returning();

  await recomputeEventTotalsService(EventID);

  return { ...created, effectiveStatus: computeEffectiveStatus(created.status, created.saleEndsAt) };
};

// Fields locked once a tier has sales — only "status" and "saleEndsAt" may change after that point.
// saleEndsAt is intentionally NOT in LOCKED_FIELDS — a host may extend or cut short an
// early-bird window after sales have started (per §3).
const LOCKED_FIELDS = ["name", "price", "totalQuantity", "groupSize", "description"] as const;

export type UpdateTicketTypeInput = Partial<{
  name: string;
  price: number;
  totalQuantity: number;
  groupSize: number | null;
  description: string;
  status: "active" | "suspended";
  // §3 — editable after sales start; null clears the expiry
  saleEndsAt: string | null;
}>;

// Updates a ticket-type tier.
// - soldQuantity > 0: only `status` and `saleEndsAt` may be present in the patch.
// - soldQuantity === 0: full patch allowed.
// Recomputes parent event totals whenever price, totalQuantity, status, or saleEndsAt changes,
// since any of these can flip a tier's effectiveStatus in or out of "active".
export const updateTicketTypeService = async (ticketTypeId: number, patch: UpdateTicketTypeInput) => {
  const existing = await db.query.TicketTypeTable.findFirst({
    where: eq(TicketTypeTable.TicketTypeID, ticketTypeId),
  });

  if (!existing) {
    return { error: "not_found" as const };
  }

  if (existing.soldQuantity > 0) {
    const lockedFieldsPresent = LOCKED_FIELDS.filter(
      (field) => patch[field as keyof UpdateTicketTypeInput] !== undefined
    );
    if (lockedFieldsPresent.length > 0) {
      return { error: "locked_fields" as const, fields: lockedFieldsPresent };
    }
  }

  const updateValues: Partial<TITicketType> = {};
  if (patch.name !== undefined) updateValues.name = patch.name;
  if (patch.price !== undefined) updateValues.price = patch.price.toFixed(2);
  if (patch.totalQuantity !== undefined) updateValues.totalQuantity = patch.totalQuantity;
  if (patch.groupSize !== undefined) updateValues.groupSize = patch.groupSize;
  if (patch.description !== undefined) updateValues.description = patch.description;
  if (patch.status !== undefined) updateValues.status = patch.status;
  if (patch.saleEndsAt !== undefined) {
    updateValues.saleEndsAt = patch.saleEndsAt ? new Date(patch.saleEndsAt) : null;
  }

  const [updated] = await db.update(TicketTypeTable)
    .set(updateValues)
    .where(eq(TicketTypeTable.TicketTypeID, ticketTypeId))
    .returning();

  // Recompute totals when anything that affects effectiveStatus changes
  const affectsTotals =
    patch.price !== undefined ||
    patch.totalQuantity !== undefined ||
    (patch.status !== undefined && patch.status !== existing.status) ||
    patch.saleEndsAt !== undefined;

  if (affectsTotals) {
    await recomputeEventTotalsService(existing.EventID);
  }

  return { ticketType: { ...updated, effectiveStatus: computeEffectiveStatus(updated.status, updated.saleEndsAt) } };
};