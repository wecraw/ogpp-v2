export interface Inverter {
  name: string;
  id: string;
  description?: string;

  voltage: number;
  maxInput: number;
  maxOutput: number;

  batteryCapacity?: number;
}
