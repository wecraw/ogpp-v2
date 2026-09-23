import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresetCardComponent } from './preset-card.component';
import { AppliancePreset } from '../../interfaces/AppliancePreset';

const preset: AppliancePreset = {
  id: 'weekend-cabin',
  name: 'Weekend cabin',
  description: 'Lights, a fridge and a few chargers',
  icon: 'bi-house',
  items: []
};

describe('PresetCardComponent', () => {
  let component: PresetCardComponent;
  let fixture: ComponentFixture<PresetCardComponent>;
  let button: HTMLButtonElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [PresetCardComponent] });
    fixture = TestBed.createComponent(PresetCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('preset', preset);
    fixture.detectChanges();
    button = fixture.nativeElement.querySelector('button');
  });

  it('renders the preset name and description', () => {
    expect(button.textContent).toContain('Weekend cabin');
    expect(button.textContent).toContain('Lights, a fridge and a few chargers');
  });

  it('emits the preset when clicked', () => {
    const emitted: AppliancePreset[] = [];
    component.onSelect.subscribe(value => emitted.push(value));

    button.click();

    expect(emitted).toEqual([preset]);
  });

  it('reflects the selected state', () => {
    expect(button.classList).not.toContain('selected');
    expect(button.getAttribute('aria-pressed')).toBe('false');

    fixture.componentRef.setInput('selected', true);
    fixture.detectChanges();

    expect(button.classList).toContain('selected');
    expect(button.getAttribute('aria-pressed')).toBe('true');
  });

  it('falls back to a default icon when the preset has none', () => {
    fixture.componentRef.setInput('preset', { ...preset, icon: undefined });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.preset-icon').classList).toContain('bi-stars');
  });
});
