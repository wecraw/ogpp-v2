import { ProductPricing } from './ProductPricing';

export interface Battery extends ProductPricing {
  name: string;
  brand: string;
  id?: string;
  icon?: string;

  batteryCapacity: number;
}

export const defaultBattery: Battery = {
  name: '',
  brand: '',
  id: '-1',
  icon: '',

  batteryCapacity: 0,

  price: 0
};
