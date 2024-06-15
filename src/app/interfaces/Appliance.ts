export interface Appliance {
  name: string;
  description?: string;
  id?: string;
  icon?: string;

  wattage: number;
  hours: number;
  quantity: number;

  applianceGroup: string;
}
