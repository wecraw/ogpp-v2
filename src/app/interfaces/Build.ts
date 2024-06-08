import { Appliance } from './Appliance';
import { Season } from './Season';
import { PowerSource } from './PowerSource';
import { Inverter } from './Inverter';
import { Battery } from './Battery';

export interface Build {
  name: string;
  id: string;

  appliances: Appliance[];
  seasons: Season[];
  zipCode: string;
  annualGhi: any;

  powerSources: PowerSource[];
  inverter: Inverter;
  batteries: Battery[];

  createdOn: Date;
  lastEdited: Date;
}
