import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Inverter } from 'src/app/interfaces/Inverter';
import { Battery } from 'src/app/interfaces/Battery';
import { PowerSource } from 'src/app/interfaces/PowerSource';
@Component({
    selector: 'build-component-card',
    imports: [CommonModule, FormsModule],
    templateUrl: './build-component-card.component.html',
    styleUrl: './build-component-card.component.scss'
})
export class BuildComponentCardComponent implements OnInit {
  // Defaults
  @Input() buildComponent!: Battery | Inverter | PowerSource;

  // State
  @Input() disabled?: boolean = false;
  @Input() selected: boolean = false;
  @Input() locked: boolean = false;
  public isDetailMode: boolean = false;

  // Quantity mode (opt-in): renders a +/- stepper instead of a single-select toggle.
  @Input() quantityMode: boolean = false;
  @Input() quantity: number = 0;
  @Input() maxQuantity?: number;

  // Events
  @Output() onSelect: EventEmitter<boolean> = new EventEmitter();
  @Output() quantityChange: EventEmitter<number> = new EventEmitter();

  // Values
  editInnerVisible: boolean = false;

  ngOnInit(): void {}

  // In quantity mode the card's selected appearance reflects whether any units are chosen.
  // Locked cards are always shown as selected.
  get isSelected(): boolean {
    if (this.locked) return true;
    return this.quantityMode ? this.quantity > 0 : this.selected;
  }

  get canIncrement(): boolean {
    return this.maxQuantity === undefined || this.quantity < this.maxQuantity;
  }

  selectClicked() {
    if (this.disabled || this.locked) return;
    if (this.quantityMode) {
      const newQuantity = this.quantity > 0 ? 0 : 1;
      this.quantity = newQuantity;
      this.quantityChange.emit(newQuantity);
      return;
    }
    this.selected = !this.selected;
    this.onSelect.emit(this.selected);
  }

  increment(event: Event) {
    event.stopPropagation();
    if (this.disabled || this.locked || !this.canIncrement) return;
    this.quantity++;
    this.quantityChange.emit(this.quantity);
  }

  decrement(event: Event) {
    event.stopPropagation();
    if (this.disabled || this.locked || this.quantity <= 0) return;
    this.quantity--;
    this.quantityChange.emit(this.quantity);
  }

  toggleDetailMode() {
    this.isDetailMode = !this.isDetailMode;
  }

  // Type Guards

  isBattery(component: Battery | Inverter | PowerSource): component is Battery {
    return (component as Battery).batteryCapacity !== undefined && !this.isInverter(component);
  }

  isInverter(component: Battery | Inverter | PowerSource): component is Inverter {
    return (component as Inverter).maxOutput !== undefined && (component as Inverter).voltages !== undefined;
  }

  isPowerSource(component: Battery | Inverter | PowerSource): component is PowerSource {
    return !this.isBattery(component) && !this.isInverter(component);
  }
}
