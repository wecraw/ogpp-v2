export interface PowerSource {
  name: string;
  brand: string;
  id?: string;
  icon?: string;

  maxOutput: number;

  price: number;
}
