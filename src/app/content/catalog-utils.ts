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
 * Preserves an explicit ID when one is provided; otherwise assigns
 * `item.id = slug(keyFn(item))`. Collisions receive a numeric suffix.
 */
export function assignStableIds<T extends { id?: string }>(
  items: T[],
  keyFn: (item: T) => string
): T[] {
  const seen = new Map<string, number>();
  for (const item of items) {
    const base = slugify(item.id ?? keyFn(item));
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    item.id = count === 0 ? base : `${base}-${count + 1}`;
  }
  return items;
}

/**
 * Custom appliances are created at runtime (not part of the static catalog), so
 * they need their own ID namespace. We prefix with `custom-` so a custom ID can
 * never collide with a catalog slug, and append a numeric suffix when the same
 * name already exists in the build. The ID round-trips through localStorage the
 * same way catalog slugs do, keeping the appliance mapped on reload.
 */
export const CUSTOM_APPLIANCE_ID_PREFIX = 'custom-';

export function isCustomApplianceId(id: string | undefined): boolean {
  return !!id && id.startsWith(CUSTOM_APPLIANCE_ID_PREFIX);
}

export function generateCustomApplianceId(name: string, existingIds: Iterable<string>): string {
  const taken = new Set(existingIds);
  const base = `${CUSTOM_APPLIANCE_ID_PREFIX}${slugify(name) || 'appliance'}`;
  if (!taken.has(base)) return base;
  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) suffix++;
  return `${base}-${suffix}`;
}
