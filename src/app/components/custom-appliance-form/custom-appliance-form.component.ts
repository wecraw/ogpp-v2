import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Appliance, UsageType } from '../../interfaces/Appliance';

/** Default group customs land in so they render together. */
export const CUSTOM_GROUP = 'Custom';

type FieldError = { name?: string; wattage?: string; hours?: string; quantity?: string };

/**
 * Modal form for adding an appliance that isn't in the curated catalog. It emits
 * a plain `Appliance` (no `id` — the builder assigns a collision-safe runtime
 * ID) that feeds the exact same sizing pipeline as catalog items.
 */
@Component({
  selector: 'custom-appliance-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './custom-appliance-form.component.html',
  styleUrls: ['./custom-appliance-form.component.scss']
})
export class CustomApplianceFormComponent {
  /** Existing builder groups, offered alongside the default `Custom` group. */
  @Input() groups: string[] = [];

  @Output() save = new EventEmitter<Appliance>();
  @Output() cancel = new EventEmitter<void>();

  readonly customGroup = CUSTOM_GROUP;
  readonly maxNameLength = 60;
  readonly maxWattage = 30000;

  name = '';
  wattage: number | null = null;
  hours: number | null = null;
  quantity = 1;
  usageType: UsageType = 'continuous';
  description = '';
  applianceGroup: string = CUSTOM_GROUP;

  errors: FieldError = {};

  /** Custom first, then any existing builder groups, de-duped. */
  get groupOptions(): string[] {
    return [CUSTOM_GROUP, ...this.groups.filter(group => group !== CUSTOM_GROUP)];
  }

  clearError(field: keyof FieldError): void {
    this.errors[field] = undefined;
  }

  onHoursInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let val = parseFloat(input.value);
    if (!isNaN(val)) {
      if (val > 24) val = 24;
      else if (val < 0) val = 0;
      this.hours = val;
      input.value = String(val);
    } else {
      this.hours = null;
    }
    this.clearError('hours');
  }

  onWattageInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let val = parseFloat(input.value);
    if (!isNaN(val)) {
      val = Math.floor(val);
      if (val > this.maxWattage) val = this.maxWattage;
      else if (val < 0) val = 0;
      this.wattage = val;
      input.value = String(val);
    } else {
      this.wattage = null;
    }
    this.clearError('wattage');
  }

  onQuantityInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let val = parseFloat(input.value);
    if (!isNaN(val)) {
      val = Math.max(1, Math.round(val));
      this.quantity = val;
      input.value = String(val);
    } else {
      this.quantity = 1;
    }
    this.clearError('quantity');
  }

  submit(): void {
    if (!this.validate()) return;

    const description = this.description.trim();
    const appliance: Appliance = {
      name: this.name.trim(),
      description: description || undefined,
      wattage: this.wattage!,
      hours: this.hours!,
      quantity: this.quantity,
      usageType: this.usageType,
      applianceGroup: this.applianceGroup.trim() || CUSTOM_GROUP,
      icon: 'bi-plug'
    };

    this.save.emit(appliance);
  }

  dismiss(): void {
    this.cancel.emit();
  }

  /** Returns true when the form is valid; otherwise populates `errors`. */
  validate(): boolean {
    const errors: FieldError = {};

    const name = this.name.trim();
    if (!name) {
      errors.name = 'Enter a name.';
    } else if (name.length > this.maxNameLength) {
      errors.name = `Keep the name under ${this.maxNameLength} characters.`;
    }

    if (!this.isPositive(this.wattage)) {
      errors.wattage = 'Enter a wattage greater than 0.';
    } else if (!Number.isInteger(this.wattage)) {
      errors.wattage = 'Wattage must be a whole number.';
    } else if (this.wattage! > this.maxWattage) {
      errors.wattage = `Wattage must be ${this.maxWattage} W or less.`;
    }

    if (!this.isPositive(this.hours)) {
      errors.hours = 'Enter run hours greater than 0.';
    } else if (this.hours! > 24) {
      errors.hours = 'Run hours can be at most 24.';
    }

    if (!this.isPositive(this.quantity)) {
      errors.quantity = 'Quantity must be at least 1.';
    } else if (!Number.isInteger(this.quantity)) {
      errors.quantity = 'Quantity must be a whole number.';
    }

    this.errors = errors;
    return Object.values(errors).every(error => !error);
  }

  // A value usable by the sizing math: a finite number strictly above zero.
  // Guards against null (blank input), NaN and Infinity reaching the totals.
  private isPositive(value: number | null): value is number {
    return typeof value === 'number' && Number.isFinite(value) && value > 0;
  }
}
