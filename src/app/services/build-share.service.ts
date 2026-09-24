import { Inject, Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { allAppliances } from '../content/appliances';
import { CATALOG, Catalog } from '../content/catalog';
import { Appliance, UsageType } from '../interfaces/Appliance';
import { Battery } from '../interfaces/Battery';
import { Build, DEFAULT_DAYS_OF_AUTONOMY, Month, MonthlyGhi } from '../interfaces/Build';
import { defaultInverter } from '../interfaces/Inverter';
import { PowerSource } from '../interfaces/PowerSource';
import { Season } from '../interfaces/Season';
import { BuildService } from './build.service';
import { ProductSelectorService } from './product-selector.service';

/**
 * Shareable build links.
 *
 * A build is encoded into the URL fragment of `/share#<payload>` so it can be opened on
 * another device/browser without accounts or a backend. Opening the link writes the build
 * into that browser's localStorage (see `importBuild`), after which it behaves like any
 * other saved build.
 *
 * The payload is compact and catalog-relative: gear is referenced by its stable catalog
 * slug + quantity and re-hydrated from the current catalogs on import (so the recipient
 * sees current specs/prices), while appliances carry their user-editable numbers since
 * those are the build's actual inputs (and custom appliances exist in no catalog).
 *
 * The fragment (not a query param) is used so the payload — which includes a ZIP code —
 * is never sent to a server in the request line or logged.
 */

const SHARE_VERSION = 1;
export const SHARE_ROUTE = 'share';

const MONTHS: Month[] = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec'
];
const SEASONS: Season[] = ['winter', 'spring', 'summer', 'fall'];

// Bounds on appliance numbers accepted from a link. They mirror what the builder UI can
// produce (custom-appliance form caps wattage at 30 kW and hours at 24), so a hand-crafted
// payload can't smuggle in negative demand or values that overflow the sizing math.
const MAX_APPLIANCE_WATTAGE = 30000;
const MAX_APPLIANCE_HOURS = 24;
const MAX_APPLIANCE_QUANTITY = 1000;

// Short keys keep the URL small; this shape is the wire format, so change it only by
// bumping SHARE_VERSION and keeping a decoder for the old version.
interface SharedAppliance {
  i?: string; // id (catalog slug or custom-*)
  n: string; // name
  g: string; // applianceGroup
  w: number; // wattage
  h: number; // hours
  q: number; // quantity
  u?: UsageType;
  ds?: string; // description — custom appliances only; catalog items restore their own
}

interface SharedBuildPayload {
  v: number;
  n?: string; // name
  a: SharedAppliance[];
  s: Season[];
  z: string; // zipCode
  m?: number[]; // monthlyGhi, jan..dec
  d: number; // daysOfAutonomy
  p?: string; // appliancePresetId
  o?: string; // bundleOfferId
  inv?: string; // inverter id
  b?: [string, number][]; // battery id, quantity
  ps?: [string, number][]; // solar panel id, quantity
}

export class InvalidShareLinkError extends Error {
  constructor() {
    super('This share link is invalid or incomplete.');
    this.name = 'InvalidShareLinkError';
  }
}

@Injectable({
  providedIn: 'root'
})
export class BuildShareService {
  constructor(
    private buildService: BuildService,
    private productSelector: ProductSelectorService,
    @Inject(CATALOG) private catalog: Catalog
  ) {}

  // ----- Encoding -----

  encode(build: Build): string {
    const payload: SharedBuildPayload = {
      v: SHARE_VERSION,
      a: (build.appliances ?? []).map(appliance => {
        const shared: SharedAppliance = {
          n: appliance.name,
          g: appliance.applianceGroup,
          w: appliance.wattage,
          h: appliance.hours,
          q: appliance.quantity
        };
        if (appliance.id) shared.i = appliance.id;
        if (appliance.usageType) shared.u = appliance.usageType;
        if (appliance.description && !findCatalogAppliance(appliance.id)) {
          shared.ds = appliance.description;
        }
        return shared;
      }),
      s: build.seasons ?? [],
      z: build.zipCode ?? '',
      // Always explicit (rather than omitted when unset) so a build encodes identically
      // before and after /build seeds the default — `importBuild` dedupes on the encoding.
      d: build.daysOfAutonomy ?? DEFAULT_DAYS_OF_AUTONOMY
    };

    if (build.name?.trim()) payload.n = build.name.trim();
    if (build.monthlyGhi) payload.m = MONTHS.map(month => build.monthlyGhi![month]);
    if (build.appliancePresetId) payload.p = build.appliancePresetId;
    if (build.bundleOfferId) payload.o = build.bundleOfferId;
    if (build.inverter?.id && build.inverter.maxOutput) payload.inv = build.inverter.id;

    const batteries = this.countIds(build.batteries ?? []);
    if (batteries.length) payload.b = batteries;
    const panels = this.countIds(build.powerSources ?? []);
    if (panels.length) payload.ps = panels;

    return toBase64Url(JSON.stringify(payload));
  }

  shareUrl(build: Build): string {
    return `${window.location.origin}/${SHARE_ROUTE}#${this.encode(build)}`;
  }

  // Copies the build's share link. Returns false when the Clipboard API is unavailable or
  // denied (e.g. an insecure origin) so the caller can fall back to showing the URL.
  async copyShareLink(build: Build): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(this.shareUrl(build));
      return true;
    } catch {
      return false;
    }
  }

  // ----- Decoding -----

  /**
   * Parses a payload back into a fresh Build (new id, dates set to now). Gear whose catalog
   * id no longer exists, or that the station can't take (incompatible, or past its
   * `maxBatteries` / `maxSolarInput` caps), is dropped rather than failing the import; the
   * recipient can re-pick it on /build. Throws `InvalidShareLinkError` for anything that
   * isn't a valid payload.
   */
  decode(encoded: string): Build {
    let payload: SharedBuildPayload;
    try {
      payload = JSON.parse(fromBase64Url(encoded));
    } catch {
      throw new InvalidShareLinkError();
    }
    if (!isPayload(payload)) throw new InvalidShareLinkError();

    const inverter = payload.inv
      ? this.catalog.inverters.find(candidate => candidate.id === payload.inv)
      : undefined;
    const now = new Date();

    const build: Build = {
      name: payload.n ?? '',
      id: uuidv4(),
      appliances: payload.a.map(shared => this.toAppliance(shared)),
      seasons: payload.s.filter(season => SEASONS.includes(season)),
      zipCode: payload.z,
      monthlyGhi: payload.m ? toMonthlyGhi(payload.m) : null,
      powerSources: [],
      inverter: inverter ?? defaultInverter,
      batteries: [],
      daysOfAutonomy: payload.d,
      createdOn: now,
      lastEdited: now
    };
    if (inverter) {
      build.batteries = this.fitBatteries(build, payload.b);
      build.powerSources = this.fitSolarPanels(build, payload.ps);
    }
    if (payload.p) build.appliancePresetId = payload.p;
    if (payload.o && inverter) build.bundleOfferId = payload.o;
    return build;
  }

  /**
   * Imports a shared payload into localStorage and returns the saved build's id. If an
   * identical build is already saved (the link was opened before, or it's the sharer's own
   * browser), that build is reused instead of piling up duplicates.
   */
  importBuild(encoded: string): string {
    const build = this.decode(encoded);
    const canonical = this.encode(build);
    const existing = this.buildService
      .listBuilds()
      .find(saved => this.safeEncode(saved) === canonical);
    if (existing) return existing.id;

    this.buildService.saveBuild(build);
    return build.id;
  }

  // ----- Helpers -----

  private safeEncode(build: Build): string | null {
    try {
      return this.encode(build);
    } catch {
      return null;
    }
  }

  // Quantities are persisted as duplicate entries (see CLAUDE.md), so collapse them into
  // [id, count] pairs, preserving first-seen order.
  private countIds(items: { id?: string }[]): [string, number][] {
    const counts = new Map<string, number>();
    for (const item of items) {
      if (!item.id) continue;
      counts.set(item.id, (counts.get(item.id) ?? 0) + 1);
    }
    return [...counts.entries()];
  }

  private expand<T extends { id?: string }>(catalog: T[], pairs?: [string, number][]): T[] {
    const result: T[] = [];
    for (const [id, quantity] of pairs ?? []) {
      const item = catalog.find(candidate => candidate.id === id);
      if (!item) continue;
      for (let i = 0; i < quantity; i++) result.push(item);
    }
    return result;
  }

  // Same limits /build enforces: only batteries the station accepts, and no more than its
  // `maxBatteries` bank total (the built-in battery isn't counted).
  private fitBatteries(build: Build, pairs?: [string, number][]): Battery[] {
    const compatible = idsOf(this.productSelector.getMatchingBatteries(build));
    const limit = build.inverter.maxBatteries ?? 0;
    return this.expand(this.catalog.batteries, pairs)
      .filter(battery => compatible.has(battery.id))
      .slice(0, limit);
  }

  // Only compatible panels, and only as many as fit within the station's `maxSolarInput`.
  private fitSolarPanels(build: Build, pairs?: [string, number][]): PowerSource[] {
    const compatible = idsOf(this.productSelector.getMatchingSolarPanels(build));
    let headroom = build.inverter.maxSolarInput ?? 0;
    return this.expand(this.catalog.solarPanels, pairs).filter(panel => {
      const wattage = panel.maxOutput ?? 0;
      if (!compatible.has(panel.id) || wattage > headroom) return false;
      headroom -= wattage;
      return true;
    });
  }

  // User-editable numbers come from the payload; display-only fields (description, icon)
  // are filled back in from the catalog when the appliance is a catalog item.
  private toAppliance(shared: SharedAppliance): Appliance {
    const catalogItem = findCatalogAppliance(shared.i);
    const appliance: Appliance = {
      ...(catalogItem ?? {}),
      name: shared.n,
      applianceGroup: shared.g,
      wattage: shared.w,
      hours: shared.h,
      quantity: shared.q
    };
    if (shared.i) appliance.id = shared.i;
    if (shared.u) appliance.usageType = shared.u;
    else delete appliance.usageType;
    if (!catalogItem && shared.ds) appliance.description = shared.ds;
    return appliance;
  }
}

function idsOf(items: { id?: string }[]): Set<string | undefined> {
  return new Set(items.map(item => item.id));
}

function findCatalogAppliance(id?: string): Appliance | undefined {
  return id ? allAppliances.find(candidate => candidate.id === id) : undefined;
}

// ----- Wire-format helpers -----

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(encoded: string): string {
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

function toMonthlyGhi(values: number[]): MonthlyGhi {
  return MONTHS.reduce((ghi, month, index) => {
    ghi[month] = values[index];
    return ghi;
  }, {} as MonthlyGhi);
}

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const inRange = (value: unknown, min: number, max: number): boolean =>
  isNumber(value) && value >= min && value <= max;

const isPairList = (value: unknown): boolean =>
  value === undefined ||
  (Array.isArray(value) &&
    value.every(
      pair =>
        Array.isArray(pair) &&
        typeof pair[0] === 'string' &&
        Number.isInteger(pair[1]) &&
        pair[1] > 0 &&
        pair[1] <= 100
    ));

// Structural validation of an untrusted payload. Anything malformed is rejected outright
// rather than half-imported, so a truncated link can't produce a corrupt saved build.
function isPayload(value: unknown): value is SharedBuildPayload {
  if (!value || typeof value !== 'object') return false;
  const payload = value as SharedBuildPayload;
  return (
    payload.v === SHARE_VERSION &&
    (payload.n === undefined || typeof payload.n === 'string') &&
    Array.isArray(payload.a) &&
    payload.a.every(
      appliance =>
        !!appliance &&
        typeof appliance === 'object' &&
        typeof appliance.n === 'string' &&
        typeof appliance.g === 'string' &&
        inRange(appliance.w, 0, MAX_APPLIANCE_WATTAGE) &&
        inRange(appliance.h, 0, MAX_APPLIANCE_HOURS) &&
        Number.isInteger(appliance.q) &&
        inRange(appliance.q, 1, MAX_APPLIANCE_QUANTITY) &&
        (appliance.ds === undefined || typeof appliance.ds === 'string') &&
        (appliance.i === undefined || typeof appliance.i === 'string') &&
        (appliance.u === undefined ||
          appliance.u === 'continuous' ||
          appliance.u === 'intermittent')
    ) &&
    Array.isArray(payload.s) &&
    typeof payload.z === 'string' &&
    (payload.m === undefined ||
      (Array.isArray(payload.m) && payload.m.length === 12 && payload.m.every(isNumber))) &&
    Number.isInteger(payload.d) &&
    payload.d >= 1 &&
    payload.d <= 7 &&
    (payload.p === undefined || typeof payload.p === 'string') &&
    (payload.o === undefined || typeof payload.o === 'string') &&
    (payload.inv === undefined || typeof payload.inv === 'string') &&
    isPairList(payload.b) &&
    isPairList(payload.ps)
  );
}
