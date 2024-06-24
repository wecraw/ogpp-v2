import { Battery } from './Battery';

export interface Inverter {
  name: string;
  brand: string;
  id?: string;
  icon?: string;

  voltages: number[];
  maxSolarInput: number;
  maxTotalInput: number;
  maxOutput: number;

  batteryCapacity?: number;

  price: number;

  compatibleBatteries?: Battery[];
  maxBatteries?: number;
}

export const defaultInverter: Inverter = {
  name: '',
  brand: '',
  id: '-1',
  icon: '',
  voltages: [],
  maxSolarInput: 0,
  maxTotalInput: 0,
  maxOutput: 0,

  batteryCapacity: 0,

  compatibleBatteries: [],
  maxBatteries: 0,

  price: 0
};
