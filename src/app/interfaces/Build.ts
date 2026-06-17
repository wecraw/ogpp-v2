import { Appliance } from './Appliance';
import { Season } from './Season';
import { PowerSource } from './PowerSource';
import { Inverter } from './Inverter';
import { Battery } from './Battery';

export type Month =
  | 'jan'
  | 'feb'
  | 'mar'
  | 'apr'
  | 'may'
  | 'jun'
  | 'jul'
  | 'aug'
  | 'sep'
  | 'oct'
  | 'nov'
  | 'dec';

export type MonthlyGhi = Record<Month, number>;

export interface Build {
  name: string;
  id: string;

  appliances: Appliance[];
  seasons: Season[];
  zipCode: string;
  monthlyGhi: MonthlyGhi | null;

  powerSources: PowerSource[];
  inverter: Inverter;
  batteries: Battery[];
  bundleOfferId?: string;

  // Days of usage the battery bank should cover. Optional so builds persisted before this
  // field existed still load — consumers fall back to a sensible default when it's absent.
  daysOfAutonomy?: number;

  createdOn: Date;
  lastEdited: Date;
}

export const defaultBuild: Build = {
  name: '',
  id: '',
  appliances: [],
  seasons: [],
  zipCode: '',
  monthlyGhi: null,
  powerSources: [],
  inverter: {} as Inverter,
  batteries: [],
  createdOn: new Date(),
  lastEdited: new Date()
};
