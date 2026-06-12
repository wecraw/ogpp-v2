import { Battery } from './Battery';
import { ProductPricing } from './ProductPricing';

export interface Inverter extends ProductPricing {
  name: string;
  brand: string;
  id?: string;
  icon?: string;

  voltages: number[];
  maxSolarInput: number;
  maxTotalInput: number;
  maxOutput: number;

  batteryCapacity?: number;

  compatibleBatteries?: Battery[];
  compatibleBatteryIds?: string[];
  compatiblePowerSourceIds?: string[];
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
