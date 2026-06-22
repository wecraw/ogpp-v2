import { batteries } from './batteries';
import { inverters } from './inverters';
import { solarPanels } from './solarPanels';
import { productBundleOffers } from './product-bundle-offers';
import { slugify } from './catalog-utils';
import { environment } from 'src/environments/environment';

/**
 * Referential-integrity guard for the hand-curated catalogs.
 *
 * Saved builds persist the *IDs* of chosen items to localStorage, and
 * compatibility arrays + bundle offers reference catalog items by those ID
 * strings (never by object reference). A typo, a rename, or an unintended slug
 * collision therefore silently orphans saved builds or hides a product from the
 * selector. These checks fail the build the moment any cross-reference dangles,
 * so the failure shows up at edit time instead of as a corrupted build later.
 *
 * Adding a product? If this spec passes, your IDs resolve. See
 * `.claude/skills/update-ogpp-products` for the authoring workflow.
 */
describe('catalog integrity', () => {
  const inverterIds = new Set(inverters.map(inverter => inverter.id));
  const batteryIds = new Set(batteries.map(battery => battery.id));
  const panelIds = new Set(solarPanels.map(panel => panel.id));

  // Every record ends up with an id after assignStableIds runs at module load.
  describe('ids are assigned and unique', () => {
    const cases: [string, { id?: string }[]][] = [
      ['inverters', inverters],
      ['batteries', batteries],
      ['solarPanels', solarPanels]
    ];

    for (const [label, items] of cases) {
      it(`${label}: every record has a non-empty id`, () => {
        const missing = items.filter(item => !item.id);
        expect(missing).withContext(`${label} records missing an id`).toEqual([]);
      });

      it(`${label}: ids are unique`, () => {
        const ids = items.map(item => item.id!);
        const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
        expect(duplicates).withContext(`duplicate ${label} ids`).toEqual([]);
      });
    }

    it('offer ids are unique', () => {
      const ids = productBundleOffers.map(offer => offer.id);
      const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
      expect(duplicates).withContext('duplicate offer ids').toEqual([]);
    });
  });

  // assignStableIds silently suffixes a colliding slug with -2/-3. This catalog
  // has no intentional collisions, so two records deriving the same base slug is
  // a mistake: one product's id would not be what the author predicted, breaking
  // any compatibility array / offer that references the predicted slug.
  describe('no unintended slug collisions', () => {
    const cases: [string, { id?: string; brand: string; name: string }[]][] = [
      ['inverters', inverters],
      ['batteries', batteries],
      ['solarPanels', solarPanels]
    ];

    for (const [label, items] of cases) {
      it(`${label}: each brand+name derives a distinct slug`, () => {
        const bySlug = new Map<string, string[]>();
        for (const item of items) {
          const base = slugify(`${item.brand}-${item.name}`);
          bySlug.set(base, [...(bySlug.get(base) ?? []), `${item.brand} ${item.name}`]);
        }
        const collisions = [...bySlug.entries()].filter(([, names]) => names.length > 1);
        expect(collisions)
          .withContext(`${label} brand+name slug collisions (one would be silently suffixed)`)
          .toEqual([]);
      });
    }
  });

  describe('inverter compatibility ids resolve', () => {
    it('every compatibleBatteryIds entry points at a real battery', () => {
      const dangling = inverters.flatMap(inverter =>
        (inverter.compatibleBatteryIds ?? [])
          .filter(id => !batteryIds.has(id))
          .map(id => `${inverter.id} -> ${id}`)
      );
      expect(dangling).withContext('dangling compatibleBatteryIds').toEqual([]);
    });

    it('every compatiblePowerSourceIds entry points at a real panel', () => {
      const dangling = inverters.flatMap(inverter =>
        (inverter.compatiblePowerSourceIds ?? [])
          .filter(id => !panelIds.has(id))
          .map(id => `${inverter.id} -> ${id}`)
      );
      expect(dangling).withContext('dangling compatiblePowerSourceIds').toEqual([]);
    });
  });

  describe('bundle offers resolve and are well-formed', () => {
    it('every offer.inverterId points at a real inverter', () => {
      const dangling = productBundleOffers
        .filter(offer => !inverterIds.has(offer.inverterId))
        .map(offer => `${offer.id} -> ${offer.inverterId}`);
      expect(dangling).withContext('offers referencing a missing inverter').toEqual([]);
    });

    it('every batteryQuantities key points at a real battery', () => {
      const dangling = productBundleOffers.flatMap(offer =>
        Object.keys(offer.batteryQuantities)
          .filter(id => !batteryIds.has(id))
          .map(id => `${offer.id} -> ${id}`)
      );
      expect(dangling).withContext('offers referencing a missing battery').toEqual([]);
    });

    it('every powerSourceQuantities key points at a real panel', () => {
      const dangling = productBundleOffers.flatMap(offer =>
        Object.keys(offer.powerSourceQuantities)
          .filter(id => !panelIds.has(id))
          .map(id => `${offer.id} -> ${id}`)
      );
      expect(dangling).withContext('offers referencing a missing panel').toEqual([]);
    });

    it('every quantity is a positive integer', () => {
      const bad = productBundleOffers.flatMap(offer =>
        [...Object.entries(offer.batteryQuantities), ...Object.entries(offer.powerSourceQuantities)]
          .filter(([, qty]) => !Number.isInteger(qty) || qty <= 0)
          .map(([id, qty]) => `${offer.id} -> ${id}=${qty}`)
      );
      expect(bad).withContext('non-positive or fractional offer quantities').toEqual([]);
    });
  });

  // Pricing-honesty invariants the checkout math assumes. A "deal" price above
  // its own list/compare price, or a bundle that costs more than its compare
  // total, points at a data-entry slip rather than a real offer.
  describe('pricing invariants', () => {
    const priced: [string, { id?: string; price: number; listPrice?: number }[]][] = [
      ['inverters', inverters],
      ['batteries', batteries],
      ['solarPanels', solarPanels]
    ];

    for (const [label, items] of priced) {
      it(`${label}: price is a positive number`, () => {
        const bad = items.filter(item => !(item.price > 0)).map(item => `${item.id}=${item.price}`);
        expect(bad).withContext(`${label} with non-positive price`).toEqual([]);
      });

      it(`${label}: listPrice (when present) is >= price`, () => {
        const bad = items
          .filter(item => item.listPrice !== undefined && item.listPrice < item.price)
          .map(item => `${item.id}: list ${item.listPrice} < price ${item.price}`);
        expect(bad).withContext(`${label} with listPrice below price`).toEqual([]);
      });
    }

    it('offers: price <= compareAtPrice', () => {
      const bad = productBundleOffers
        .filter(offer => offer.price > offer.compareAtPrice)
        .map(offer => `${offer.id}: price ${offer.price} > compare ${offer.compareAtPrice}`);
      expect(bad).withContext('offers priced above their compare price').toEqual([]);
    });

    it('offers: presetPrice (when present) is >= price', () => {
      const bad = productBundleOffers
        .filter(offer => offer.presetPrice !== undefined && offer.presetPrice < offer.price)
        .map(offer => `${offer.id}: preset ${offer.presetPrice} < price ${offer.price}`);
      expect(bad).withContext('offers with a preset price below the charged price').toEqual([]);
    });
  });

  // Outbound product/offer links are decorated by AffiliateLinkService, keyed on
  // the product `brand` / offer `vendor` string. A brand with no entry in the
  // vendor map still links out, but carries no affiliate `ref` — money left on
  // the table. This catches a new brand (or a renamed one) before it ships.
  describe('affiliate vendor coverage', () => {
    const vendorKeys = new Set(Object.keys(environment.affiliate.vendors));

    it('every catalog brand has an affiliate vendor entry', () => {
      const brands = new Set([
        ...inverters.map(item => item.brand),
        ...batteries.map(item => item.brand),
        ...solarPanels.map(item => item.brand)
      ]);
      const missing = [...brands].filter(brand => !vendorKeys.has(brand));
      expect(missing).withContext('catalog brands with no affiliate vendor entry').toEqual([]);
    });

    it('every offer vendor has an affiliate vendor entry', () => {
      const missing = productBundleOffers
        .map(offer => offer.vendor)
        .filter(vendor => !vendorKeys.has(vendor));
      expect([...new Set(missing)])
        .withContext('offer vendors with no affiliate vendor entry')
        .toEqual([]);
    });
  });
});
