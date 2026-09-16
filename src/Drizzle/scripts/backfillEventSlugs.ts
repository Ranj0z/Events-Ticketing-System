// One-off backfill script (NOT a migration file).
// Run manually once the `slug` column + `event_slug_history` table have been
// migrated onto the `events` table:
//   pnpm tsx src/Drizzle/scripts/backfillEventSlugs.ts
//
// Place this file at: src/Drizzle/scripts/backfillEventSlugs.ts
// (imports below assume that location, matching seed.ts's "../db" / "../schema" pattern)
//
// Safe to re-run: only events with a NULL slug are processed, so a partial
// or failed run can be resumed without reassigning or clobbering slugs that
// were already backfilled.
//
// What it does:
//   1. Loads every event with slug IS NULL, ordered by EventID (stable, so
//      re-runs process remaining events in the same order).
//   2. Generates a slug from that event's title (lowercase, hyphenated,
//      stripped of special characters, truncated to fit the column).
//   3. Ensures uniqueness against: slugs already in `events`, slugs already
//      in `event_slug_history`, and slugs assigned earlier in this same run
//      — appending -2, -3, ... on collision.
//   4. Writes the slug to that event's row.
//
// This is a first-run backfill only: it never writes to
// `event_slug_history` itself (that table only gets entries later, when a
// host renames an event post-backfill).

import db from "../db";
import { EventsTable, EventSlugHistoryTable } from "../schema";
import { isNull, eq } from "drizzle-orm";

const MAX_SLUG_LENGTH = 60; // must match events.slug varchar(60)

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // non-alphanumeric runs -> single hyphen
    .replace(/^-+|-+$/g, ""); // strip leading/trailing hyphens

  if (base.length === 0) {
    // Title was empty or entirely non-alphanumeric (e.g. emoji-only).
    return `event-${Date.now()}`;
  }

  return base.slice(0, MAX_SLUG_LENGTH);
}

function withSuffix(slug: string, suffix: number): string {
  const suffixStr = `-${suffix}`;
  const trimmed = slug.slice(0, MAX_SLUG_LENGTH - suffixStr.length);
  return `${trimmed}${suffixStr}`;
}

async function backfillEventSlugs() {
  console.log("=== Event slug backfill: starting ===");

  const events = await db
    .select({ EventID: EventsTable.EventID, title: EventsTable.title })
    .from(EventsTable)
    .where(isNull(EventsTable.slug))
    .orderBy(EventsTable.EventID);

  console.log(`Found ${events.length} event(s) with no slug.`);

  if (events.length === 0) {
    console.log("Nothing to do. === Event slug backfill: done ===");
    return;
  }

  // Pull every slug already in use (existing events + retired slugs) once,
  // up front, so per-event collision checks are in-memory instead of one
  // query per attempt.
  const existingEventSlugs = await db
    .select({ slug: EventsTable.slug })
    .from(EventsTable);
  const existingHistorySlugs = await db
    .select({ slug: EventSlugHistoryTable.slug })
    .from(EventSlugHistoryTable);

  const takenSlugs = new Set<string>([
    ...existingEventSlugs.map((r) => r.slug).filter((s): s is string => !!s),
    ...existingHistorySlugs.map((r) => r.slug),
  ]);

  let assigned = 0;
  let collisionsResolved = 0;
  let fallbacksUsed = 0;

  for (const event of events) {
    const base = slugify(event.title);
    if (base.startsWith("event-")) fallbacksUsed++;

    let candidate = base;
    let suffix = 2;
    let hadCollision = false;

    while (takenSlugs.has(candidate)) {
      hadCollision = true;
      candidate = withSuffix(base, suffix);
      suffix++;
    }

    if (hadCollision) collisionsResolved++;

    await db
      .update(EventsTable)
      .set({ slug: candidate })
      .where(eq(EventsTable.EventID, event.EventID));

    takenSlugs.add(candidate);
    assigned++;

    console.log(`  EventID ${event.EventID}: "${event.title}" -> "${candidate}"`);
  }

  console.log("=== Event slug backfill: done ===");
  console.log(`  Events processed:      ${assigned}`);
  console.log(`  Collisions resolved:   ${collisionsResolved}`);
  console.log(`  Fallback slugs used:   ${fallbacksUsed} (title had no usable characters)`);
}

backfillEventSlugs()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Backfill failed:", error);
    process.exit(1);
  });
