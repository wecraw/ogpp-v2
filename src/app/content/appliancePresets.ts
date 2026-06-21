import { AppliancePreset } from '../interfaces/AppliancePreset';
import { assignStableIds } from './catalog-utils';

/**
 * Curated builder starting points. Each item references a catalog appliance by
 * its stable id (see `appliances.ts`); optional `quantity`/`hours` override the
 * catalog default for that scenario. A unit test fails loudly if any id here
 * stops resolving to a real catalog appliance, guarding against catalog drift.
 */
const appliancePresets: AppliancePreset[] = [
  {
    name: 'RV kit',
    description: 'Fridge, lights, devices and a fan for life on the road.',
    icon: 'bi-truck-front',
    items: [
      { applianceId: 'kitchen-fridge' },
      { applianceId: 'heating-cooling-box-fan' },
      { applianceId: 'entertainment-tv', hours: 3 },
      { applianceId: 'lighting-led-light-bulb', quantity: 4 },
      { applianceId: 'office-devices-laptop' },
      { applianceId: 'office-devices-phone-tablet-charger', quantity: 2 },
      { applianceId: 'kitchen-coffee-maker' }
    ]
  },
  {
    name: 'CPAP + phones',
    description: 'Overnight medical device plus charging for a couple of phones.',
    icon: 'bi-lungs',
    items: [
      { applianceId: 'health-medical-cpap-machine' },
      { applianceId: 'office-devices-phone-tablet-charger', quantity: 2 }
    ]
  },
  {
    name: 'Cabin weekend',
    description: 'Keep the lights, fridge and coffee going for a getaway.',
    icon: 'bi-house',
    items: [
      { applianceId: 'kitchen-fridge' },
      { applianceId: 'lighting-led-light-bulb', quantity: 6 },
      { applianceId: 'kitchen-coffee-maker' },
      { applianceId: 'entertainment-tv', hours: 3 },
      { applianceId: 'heating-cooling-space-heater', hours: 3 },
      { applianceId: 'office-devices-phone-tablet-charger', quantity: 2 }
    ]
  },
  {
    name: 'Van life basics',
    description: 'A lean setup: fridge, fan, lights and a work laptop.',
    icon: 'bi-truck',
    items: [
      { applianceId: 'kitchen-fridge' },
      { applianceId: 'heating-cooling-box-fan' },
      { applianceId: 'lighting-led-light-bulb', quantity: 4 },
      { applianceId: 'office-devices-laptop' },
      { applianceId: 'office-devices-phone-tablet-charger', quantity: 2 },
      { applianceId: 'entertainment-router-modem' }
    ]
  },
  {
    name: 'Emergency backup',
    description: 'Ride out an outage: fridge, lights, internet and heat.',
    icon: 'bi-shield-exclamation',
    items: [
      { applianceId: 'kitchen-fridge' },
      { applianceId: 'lighting-led-light-bulb', quantity: 4 },
      { applianceId: 'entertainment-router-modem' },
      { applianceId: 'heating-cooling-space-heater', hours: 4 },
      { applianceId: 'office-devices-phone-tablet-charger', quantity: 2 }
    ]
  }
];

assignStableIds(appliancePresets, preset => preset.name);

export { appliancePresets };
