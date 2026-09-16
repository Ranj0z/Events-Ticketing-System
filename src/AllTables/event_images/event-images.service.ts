import { eq, asc, count } from "drizzle-orm";
import db from "../../Drizzle/db";
import { EventImagesTable, EventsTable } from "../../Drizzle/schema";
import { deleteImageService } from "../uploads/upload.service";

// Cap on additional carousel images per event — separate from the event's own
// primary/hero image (EventsTable.image_url).
const MAX_IMAGES_PER_EVENT = 6;

// Adds a carousel image for an event, appended after any existing ones
// (sortOrder = current count). Rejects once the event already has
// MAX_IMAGES_PER_EVENT images.
export const addEventImageService = async (eventId: number, url: string, public_id: string) => {
  const [{ value: existingCount }] = await db
    .select({ value: count() })
    .from(EventImagesTable)
    .where(eq(EventImagesTable.EventID, eventId));

  if (existingCount >= MAX_IMAGES_PER_EVENT) {
    throw new Error(`Maximum of ${MAX_IMAGES_PER_EVENT} additional images per event`);
  }

  const [created] = await db.insert(EventImagesTable).values({
    EventID: eventId,
    url,
    public_id,
    sortOrder: existingCount,
  }).returning();

  return created;
};

// All carousel images for an event, in display order.
export const getEventImagesService = async (eventId: number) => {
  return db.query.EventImagesTable.findMany({
    where: eq(EventImagesTable.EventID, eventId),
    orderBy: asc(EventImagesTable.sortOrder),
  });
};

// Deletes a carousel image: fetches it first (need public_id before the row is
// gone), removes the DB row, then best-effort cleans up the Cloudinary asset —
// a Cloudinary-side failure never blocks the DB delete from succeeding.
export const deleteEventImageService = async (imageId: number) => {
  const existing = await db.query.EventImagesTable.findFirst({
    where: eq(EventImagesTable.id, imageId),
  });

  if (!existing) {
    throw new Error("Event image not found");
  }

  await db.delete(EventImagesTable).where(eq(EventImagesTable.id, imageId));

  deleteImageService(existing.public_id);

  return existing;
};

// Resolves the HostID that owns a carousel image, via its parent event. Used by
// the requireOwnerOrAdmin auth middleware on the delete route, since ownership
// isn't a direct field on event_images — same pattern as
// ticket-type.service.ts's getTicketTypeOwnerHostIdService.
export const getEventImageOwnerHostIdService = async (imageId: number): Promise<number | null> => {
  const image = await db.query.EventImagesTable.findFirst({
    where: eq(EventImagesTable.id, imageId),
    columns: { EventID: true },
  });
  if (!image) return null;

  const event = await db.query.EventsTable.findFirst({
    where: eq(EventsTable.EventID, image.EventID),
    columns: { HostID: true },
  });
  return event?.HostID ?? null;
};
