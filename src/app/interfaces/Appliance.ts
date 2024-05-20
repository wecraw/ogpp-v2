export interface Appliance {
  name: string;
  description?: string;
  id?: string;
  icon?: any;

  wattage: number;
  hours: number;
  quantity: number;

  applianceGroup?: string;
}
