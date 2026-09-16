import { randomBytes } from "crypto";

// Leaves headroom within the 60-char slug column for a numeric dedupe suffix
// (e.g. "-23") that the caller appends on collision.
const BASE_SLUG_LENGTH = 50;

// Lowercases, trims, and replaces anything non-alphanumeric with a single "-",
// collapsing repeats and stripping leading/trailing hyphens. Falls back to a
// short random slug if nothing alphanumeric survives (e.g. an all-emoji title)
// so this never returns an empty string.
export const slugify = (title: string): string => {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, BASE_SLUG_LENGTH)
    .replace(/-+$/g, ""); // a length cut can leave a dangling trailing "-"

  if (base.length > 0) return base;

  return `event-${randomBytes(4).toString("hex")}`;
};
