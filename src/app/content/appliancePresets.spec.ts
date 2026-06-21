import { appliancePresets } from './appliancePresets';
import { allAppliances } from './appliances';
import { Build, defaultBuild } from '../interfaces/Build';
import { Appliance } from '../interfaces/Appliance';
import { CalculationUtilsService } from '../services/calculation-utils.service';

// Mirrors BuilderComponent.applyPreset: resolve each preset item to its catalog
// appliance and apply the quantity/hours overrides, producing the appliance set
// the preset would populate into a build.
function resolvePresetAppliances(presetId: string): Appliance[] {
  const preset = appliancePresets.find(p => p.id === presetId)!;
  return preset.items.map(item => {
    const catalog = allAppliances.find(appliance => appliance.id === item.applianceId)!;
    const resolved: Appliance = { ...catalog };
    if (item.quantity !== undefined) resolved.quantity = item.quantity;
    if (item.hours !== undefined) resolved.hours = item.hours;
    return resolved;
  });
}

describe('appliancePresets', () => {
  it('assigns a stable, unique id to every preset', () => {
    const ids = appliancePresets.map(preset => preset.id);
    expect(ids.every(id => !!id)).toBeTrue();
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every PresetItem.applianceId resolves to a real catalog appliance', () => {
    const catalogIds = new Set(allAppliances.map(appliance => appliance.id));
    for (const preset of appliancePresets) {
      for (const item of preset.items) {
        expect(catalogIds.has(item.applianceId))
          .withContext(`preset "${preset.name}" references unknown appliance "${item.applianceId}"`)
          .toBeTrue();
      }
    }
  });

  describe('applying a preset', () => {
    let calc: CalculationUtilsService;

    beforeEach(() => {
      calc = new CalculationUtilsService();
    });

    it('yields the expected peak wattage and watt-hours for a known preset', () => {
      const cpap = appliancePresets.find(p => p.name === 'CPAP + phones')!;
      const build: Build = { ...defaultBuild, appliances: resolvePresetAppliances(cpap.id!) };

      // CPAP: 40 W continuous; USB-C charger: 20 W × qty 2 continuous.
      expect(calc.peakWattage(build)).toBe(40 + 20 * 2);
      // CPAP: 40 × 8h; charger: 20 × 2h × qty 2.
      expect(calc.totalWattHours(build)).toBe(40 * 8 + 20 * 2 * 2);
    });

    it('applies quantity and hours overrides over catalog defaults', () => {
      const rv = appliancePresets.find(p => p.name === 'RV kit')!;
      const appliances = resolvePresetAppliances(rv.id!);

      const bulb = appliances.find(a => a.id === 'lighting-led-light-bulb')!;
      const tv = appliances.find(a => a.id === 'entertainment-tv')!;

      // RV kit overrides the bulb quantity (4) and TV run-hours (3)...
      expect(bulb.quantity).toBe(4);
      expect(tv.hours).toBe(3);

      // ...while leaving non-overridden specs at the catalog default.
      const catalogBulb = allAppliances.find(a => a.id === 'lighting-led-light-bulb')!;
      expect(bulb.wattage).toBe(catalogBulb.wattage);
    });
  });
});
