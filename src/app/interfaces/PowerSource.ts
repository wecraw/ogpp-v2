import { ProductPricing } from './ProductPricing';

export interface PowerSource extends ProductPricing {
  name: string;
  brand: string;
  id?: string;
  icon?: string;

  maxOutput: number;
}
