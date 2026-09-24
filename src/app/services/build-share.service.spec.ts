import { TestBed } from '@angular/core/testing';

import { allAppliances } from '../content/appliances';
import { batteries } from '../content/batteries';
import { inverters } from '../content/inverters';
import { solarPanels } from '../content/solarPanels';
import { Build, MonthlyGhi, defaultBuild } from '../interfaces/Build';
import { BuildService } from './build.service';
import { BuildShareService, InvalidShareLinkError } from './build-share.service';

describe('BuildShareService', () => {
  let service: BuildShareService;
  let buildService: BuildService;

  const deltaPro = inverters.find(item => item.id === 'ecoflow-delta-pro')!;
  const deltaProBattery = batteries.find(item => item.id === 'ecoflow-delta-pro-smart-battery')!;
  const panel400 = solarPanels.find(item => item.id === 'ecoflow-400w-portable-solar-panel')!;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(BuildShareService);
    buildService = TestBed.inject(BuildService);
  });

  afterEach(() => localStorage.clear());

  function makeBuild(overrides: Partial<Build> = {}): Build {
    const fridge = allAppliances.find(item => item.name === 'Fridge')!;
    const monthlyGhi = {
      jan: 2.5,
      feb: 3,
      mar: 4,
      apr: 5,
      may: 5.5,
      jun: 6,
      jul: 6.2,
      aug: 5.8,
      sep: 5,
      oct: 4,
      nov: 3,
      dec: 2.4
    } as MonthlyGhi;
    return {
      ...defaultBuild,
      id: 'original-id',
      name: 'Cabin ☀️',
      appliances: [
        // A catalog appliance the user tweaked...
        { ...fridge, hours: 6, quantity: 2 },
        // ...and a custom one that exists in no catalog.
        {
          id: 'custom-ham-radio',
          name: 'Ham radio',
          applianceGroup: 'Custom',
          wattage: 90,
          hours: 3,
          quantity: 1,
          usageType: 'intermittent'
        }
      ],
      seasons: ['winter', 'summer'],
      zipCode: '80302',
      monthlyGhi,
      inverter: deltaPro,
      batteries: [deltaProBattery, deltaProBattery],
      powerSources: [panel400, panel400, panel400],
      daysOfAutonomy: 3,
      ...overrides
    };
  }

  it('round-trips a build through a URL-safe payload', () => {
    const original = makeBuild();
    const encoded = service.encode(original);
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);

    const decoded = service.decode(encoded);
    expect(decoded.id).not.toBe(original.id);
    expect(decoded.name).toBe('Cabin ☀️');
    expect(decoded.seasons).toEqual(['winter', 'summer']);
    expect(decoded.zipCode).toBe('80302');
    expect(decoded.monthlyGhi).toEqual(original.monthlyGhi);
    expect(decoded.daysOfAutonomy).toBe(3);
    expect(decoded.inverter).toBe(deltaPro);
    expect(decoded.batteries).toEqual([deltaProBattery, deltaProBattery]);
    expect(decoded.powerSources.length).toBe(3);
    expect(decoded.powerSources.every(item => item === panel400)).toBeTrue();
  });

  it('keeps edited appliance numbers and restores catalog display fields', () => {
    const decoded = service.decode(service.encode(makeBuild()));
    const [fridge, radio] = decoded.appliances;

    expect(fridge.hours).toBe(6);
    expect(fridge.quantity).toBe(2);
    expect(fridge.description).toBe('20 cu ft cycling');
    expect(fridge.icon).toBeTruthy();

    expect(radio).toEqual({
      id: 'custom-ham-radio',
      name: 'Ham radio',
      applianceGroup: 'Custom',
      wattage: 90,
      hours: 3,
      quantity: 1,
      usageType: 'intermittent'
    });
  });

  it('drops gear that is no longer in the catalog', () => {
    const build = makeBuild({
      batteries: [deltaProBattery, { ...deltaProBattery, id: 'discontinued-battery' }]
    });
    const decoded = service.decode(service.encode(build));
    expect(decoded.batteries).toEqual([deltaProBattery]);
  });

  it('shares a builder-only build with no station chosen', () => {
    const build = makeBuild({ inverter: {} as Build['inverter'], batteries: [], powerSources: [] });
    const decoded = service.decode(service.encode(build));
    expect(decoded.inverter.maxOutput).toBe(0);
    expect(decoded.batteries).toEqual([]);
  });

  it('rejects garbage and truncated payloads', () => {
    const encoded = service.encode(makeBuild());
    expect(() => service.decode('not-a-payload')).toThrowError(InvalidShareLinkError);
    expect(() => service.decode(encoded.slice(0, encoded.length / 2))).toThrowError(
      InvalidShareLinkError
    );
    expect(() => service.decode(btoa(JSON.stringify({ v: 99 })))).toThrowError(
      InvalidShareLinkError
    );
  });

  it('imports into localStorage and reuses an identical saved build', () => {
    const encoded = service.encode(makeBuild());

    const firstId = service.importBuild(encoded);
    expect(buildService.getBuild(firstId)?.name).toBe('Cabin ☀️');

    const secondId = service.importBuild(encoded);
    expect(secondId).toBe(firstId);
    expect(buildService.listBuilds().length).toBe(1);
  });

  it("doesn't overwrite the sharer's own build when opened in the same browser", () => {
    const original = makeBuild();
    buildService.saveBuild(original);

    const importedId = service.importBuild(service.encode(original));
    expect(importedId).toBe(original.id);
    expect(buildService.listBuilds().length).toBe(1);
  });

  it('builds a /share link with the payload in the fragment', () => {
    const url = service.shareUrl(makeBuild());
    expect(url).toContain(`${window.location.origin}/share#`);
    expect(url).not.toContain('?');
  });
});
