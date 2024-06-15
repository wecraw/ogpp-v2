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
}
