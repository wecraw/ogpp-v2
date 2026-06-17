export type UsageType = 'continuous' | 'intermittent';

export interface Appliance {
  name: string;
  description?: string;
  id?: string;
  icon?: string;

  wattage: number;
  hours: number;
  quantity: number;

  /**
   * How the appliance draws power, for coincident-load (diversity factor) sizing.
   * - `continuous`: runs for extended stretches and realistically overlaps with
   *   other loads (fridge, lights, fans). Counted in full toward peak wattage.
   * - `intermittent`: brief, high-draw bursts that rarely stack (kettle, microwave,
   *   dryer). Only the single largest intermittent load counts toward peak wattage.
   *
   * Defaults to `continuous` when omitted — the conservative choice that never
   * undersizes the inverter.
   */
  usageType?: UsageType;

  applianceGroup: string;
}
