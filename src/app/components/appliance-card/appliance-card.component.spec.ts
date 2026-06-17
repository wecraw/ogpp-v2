import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Appliance } from '../../interfaces/Appliance';
import { ApplianceCardComponent } from './appliance-card.component';

describe('ApplianceCardComponent', () => {
  let component: ApplianceCardComponent;
  let fixture: ComponentFixture<ApplianceCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplianceCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ApplianceCardComponent);
    component = fixture.componentInstance;
    component.appliance = createAppliance();
    fixture.detectChanges();
  });

  it('renders the supplied appliance details', () => {
    expect(component).toBeTruthy();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.name')?.textContent).toContain('Fridge');
    expect(element.textContent).toContain('125 Watts');
    expect(element.textContent).toContain('6 Hours/day');
  });

  it('toggles selection and emits the selected state outside edit mode', () => {
    spyOn(component.onSelect, 'emit');

    component.selectClicked();

    expect(component.selected).toBeTrue();
    expect(component.onSelect.emit).toHaveBeenCalledWith(true);
  });

  it('restores blank numeric edits to defaults when edit mode is saved', () => {
    spyOn(component.onEdit, 'emit');
    const event = {
      stopPropagation: jasmine.createSpy('stopPropagation')
    } as unknown as MouseEvent;

    component.toggleEditMode(event);
    component.appliance.quantity = 0;
    component.appliance.wattage = 0;
    component.appliance.hours = 0;

    component.toggleEditMode(event);

    expect(component.appliance.quantity).toBe(1);
    expect(component.appliance.wattage).toBe(125);
    expect(component.appliance.hours).toBe(6);
    expect(component.isEditMode).toBeFalse();
    expect(component.onEdit.emit).toHaveBeenCalledWith(component.appliance);
  });
});

function createAppliance(): Appliance {
  return {
    id: 'fridge',
    name: 'Fridge',
    icon: 'bi-snow',
    wattage: 125,
    hours: 6,
    quantity: 1,
    applianceGroup: 'Kitchen'
  };
}
