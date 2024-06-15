import { Inverter } from 'src/app/interfaces/Inverter';

let inverters: Inverter[] = [
  {
    name: 'DELTA Pro 3',
    brand: 'EcoFlow',
    icon: 'bi-battery-charging',
    voltages: [120, 240],
    maxSolarInput: 2600,
    maxTotalInput: 7000,
    maxOutput: 4000,
    batteryCapacity: 4096,
    price: 1999 //placeholder
  },
  {
    name: 'Solar Generator 1000 v2',
    brand: 'Jackery',
    icon: 'bi-battery-charging',
    voltages: [120],
    maxSolarInput: 400,
    maxTotalInput: 400,
    maxOutput: 1000,
    batteryCapacity: 1070,
    price: 799
  },
  {
    name: 'AC200MAX',
    brand: 'Bluetti',
    icon: 'bi-battery-charging',
    voltages: [120],
    maxSolarInput: 900,
    maxTotalInput: 1400,
    maxOutput: 2200,
    batteryCapacity: 2048,
    price: 1199
  }
];

let count = 0;
inverters.forEach(inverter => {
  inverter.id = '' + count;
  count++;
});

export { inverters };
