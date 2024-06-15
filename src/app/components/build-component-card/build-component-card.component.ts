import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Inverter } from 'src/app/interfaces/Inverter';
import { Battery } from 'src/app/interfaces/Battery';
import { PowerSource } from 'src/app/interfaces/PowerSource';
@Component({
  selector: 'build-component-card',
  standalone: true,
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
  public isDetailMode: boolean = false;

  // Events
  @Output() onSelect: EventEmitter<boolean> = new EventEmitter();

  // Values
  editInnerVisible: boolean = false;

  ngOnInit(): void {}

  selectClicked() {
    this.selected = !this.selected;
    this.onSelect.emit(this.selected);
  }

  toggleDetailMode() {
    this.isDetailMode = !this.isDetailMode;
  }

  // Type Guards

  isBattery(component: Battery | Inverter | PowerSource): component is Battery {
    return (component as Battery).batteryCapacity !== undefined;
  }

  isInverter(component: Battery | Inverter | PowerSource): component is Inverter {
    return (component as Inverter).maxOutput !== undefined;
  }

  isPowerSource(component: Battery | Inverter | PowerSource): component is PowerSource {
    return !this.isBattery(component) && !this.isInverter(component);
  }
}
