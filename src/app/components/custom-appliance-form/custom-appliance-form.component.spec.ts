import { TestBed } from '@angular/core/testing';
import { Appliance } from '../../interfaces/Appliance';
import {
  CUSTOM_GROUP,
  CustomApplianceFormComponent
} from './custom-appliance-form.component';

describe('CustomApplianceFormComponent', () => {
  let component: CustomApplianceFormComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomApplianceFormComponent]
    }).compileComponents();

    component = TestBed.createComponent(CustomApplianceFormComponent).componentInstance;
  });

  const fillValid = () => {
    component.name = 'Well pump';
    component.wattage = 800;
    component.hours = 2;
    component.quantity = 1;
  };

  it('emits a fully-formed appliance for valid input', () => {
    const emitted: Appliance[] = [];
    component.save.subscribe(appliance => emitted.push(appliance));

    fillValid();
    component.usageType = 'intermittent';
    component.description = '  deep well  ';
    component.submit();

    expect(emitted.length).toBe(1);
    expect(emitted[0]).toEqual(
      jasmine.objectContaining({
        name: 'Well pump',
        description: 'deep well',
        wattage: 800,
        hours: 2,
        quantity: 1,
        usageType: 'intermittent',
        applianceGroup: CUSTOM_GROUP
      })
    );
  });

  it('trims the name and omits a blank description', () => {
    const emitted: Appliance[] = [];
    component.save.subscribe(appliance => emitted.push(appliance));

    fillValid();
    component.name = '  Heater  ';
    component.description = '   ';
    component.submit();

    expect(emitted[0].name).toBe('Heater');
    expect(emitted[0].description).toBeUndefined();
  });

  it('blocks a blank name', () => {
    let emitted = false;
    component.save.subscribe(() => (emitted = true));

    fillValid();
    component.name = '   ';
    component.submit();

    expect(emitted).toBeFalse();
    expect(component.errors.name).toBeTruthy();
  });

  it('blocks zero, negative and non-finite wattage', () => {
    for (const value of [0, -5, NaN, Infinity, null]) {
      component.errors = {};
      fillValid();
      component.wattage = value as number;
      expect(component.validate()).withContext(`wattage=${value}`).toBeFalse();
      expect(component.errors.wattage).toBeTruthy();
    }
  });

  it('blocks fractional wattage and quantity', () => {
    fillValid();
    component.wattage = 100.5;
    expect(component.validate()).toBeFalse();
    expect(component.errors.wattage).toBeTruthy();

    fillValid();
    component.quantity = 1.5;
    expect(component.validate()).toBeFalse();
    expect(component.errors.quantity).toBeTruthy();
  });

  it('blocks wattage above the upper bound', () => {
    fillValid();
    component.wattage = 30001;
    expect(component.validate()).toBeFalse();
    expect(component.errors.wattage).toBeTruthy();
  });

  it('blocks non-positive hours and hours over 24', () => {
    fillValid();
    component.hours = 0;
    expect(component.validate()).toBeFalse();
    expect(component.errors.hours).toBeTruthy();

    fillValid();
    component.hours = 25;
    expect(component.validate()).toBeFalse();
    expect(component.errors.hours).toBeTruthy();
  });

  it('accepts fractional run hours', () => {
    fillValid();
    component.hours = 0.15;
    expect(component.validate()).toBeTrue();
  });

  it('blocks quantity below 1', () => {
    fillValid();
    component.quantity = 0;
    expect(component.validate()).toBeFalse();
    expect(component.errors.quantity).toBeTruthy();
  });

  it('offers Custom first, then existing groups, de-duped', () => {
    component.groups = ['Kitchen', 'Custom', 'Office'];
    expect(component.groupOptions).toEqual([CUSTOM_GROUP, 'Kitchen', 'Office']);
  });
});
