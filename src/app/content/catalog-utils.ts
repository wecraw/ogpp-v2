/**
 * Stable, content-derived IDs for the hand-curated catalogs.
 *
 * IDs must NOT be positional: builds are persisted to localStorage with the IDs
 * of their chosen items, so an item's ID has to survive reordering, inserts and
 * deletes in the catalog array. We derive each ID from a slug of stable fields
 * (e.g. brand + name) instead of its index.
 */

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Assigns `item.id = slug(keyFn(item))` to every item, de-duplicating any
 * collisions with a numeric suffix so IDs stay unique and deterministic.
 */
export function assignStableIds<T extends { id?: string }>(
  items: T[],
  keyFn: (item: T) => string
): T[] {
  const seen = new Map<string, number>();
  for (const item of items) {
    const base = slugify(keyFn(item));
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    item.id = count === 0 ? base : `${base}-${count + 1}`;
  }
  return items;
}
