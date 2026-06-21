/**
 * A curated starting point for the builder — a named bundle of catalog
 * appliances that pre-populates a sensible selection in one click.
 *
 * Presets reference catalog appliances **by id** (never embed full appliance
 * definitions) so they survive catalog reordering and keep a single source of
 * truth for appliance specs. Per-item `quantity`/`hours` overrides let a preset
 * tweak the catalog default (e.g. fewer bulbs in a van than a cabin) without
 * forking the appliance.
 */
export interface PresetItem {
  applianceId: string;
  quantity?: number;
  hours?: number;
}

export interface AppliancePreset {
  // Stable slug, assigned via assignStableIds at module-load time.
  id?: string;
  name: string;
  description: string;
  // bootstrap-icons class, consistent with appliance icons (e.g. 'bi-truck').
  icon?: string;
  items: PresetItem[];
}
