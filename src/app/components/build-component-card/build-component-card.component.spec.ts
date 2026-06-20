import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Inverter } from 'src/app/interfaces/Inverter';
import { BuildComponentCardComponent } from './build-component-card.component';

describe('BuildComponentCardComponent', () => {
  let component: BuildComponentCardComponent;
  let fixture: ComponentFixture<BuildComponentCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuildComponentCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(BuildComponentCardComponent);
    component = fixture.componentInstance;
    component.buildComponent = createInverter();
    fixture.detectChanges();
  });

  it('renders the supplied product details', () => {
    expect(component).toBeTruthy();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('EcoFlow');
    expect(element.textContent).toContain('DELTA Test');
    expect(element.textContent).toContain('2000 W Output');
  });

  it('toggles single-select mode and emits the selected state', () => {
    spyOn(component.onSelect, 'emit');

    component.selectClicked();

    expect(component.selected).toBeTrue();
    expect(component.onSelect.emit).toHaveBeenCalledWith(true);
  });

  it('increments quantity mode up to max quantity', () => {
    spyOn(component.quantityChange, 'emit');
    const event = { stopPropagation: jasmine.createSpy('stopPropagation') } as unknown as Event;
    component.quantityMode = true;
    component.quantity = 1;
    component.maxQuantity = 2;

    component.increment(event);
    component.increment(event);

    expect(component.quantity).toBe(2);
    expect(component.canIncrement).toBeFalse();
    expect(component.quantityChange.emit).toHaveBeenCalledOnceWith(2);
  });

  it('treats locked cards as selected and ignores clicks', () => {
    spyOn(component.onSelect, 'emit');
    component.locked = true;

    component.selectClicked();

    expect(component.isSelected).toBeTrue();
    expect(component.selected).toBeFalse();
    expect(component.onSelect.emit).not.toHaveBeenCalled();
  });
});

function createInverter(): Inverter {
  return {
    id: 'ecoflow-delta-test',
    name: 'DELTA Test',
    brand: 'EcoFlow',
    icon: 'bi-battery-charging',
    voltages: [120],
    maxSolarInput: 1000,
    maxTotalInput: 2000,
    maxOutput: 2000,
    batteryCapacity: 1024,
    maxBatteries: 2,
    price: 999
  };
}
