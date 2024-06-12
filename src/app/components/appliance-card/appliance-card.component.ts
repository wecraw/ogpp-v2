import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Appliance } from '../../interfaces/Appliance';

@Component({
  selector: 'appliance-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appliance-card.component.html',
  styleUrls: ['./appliance-card.component.scss']
})
export class ApplianceCardComponent implements OnInit {
  // Defaults
  @Input() appliance!: Appliance;

  // State
  @Input() disabled?: boolean = false;
  @Input() selected: boolean = false;
  @Input() originalAppliance?: Appliance | undefined;
  public defaultAppliance!: Appliance;
  public isEditMode: boolean = false;
  public nameRequired: boolean = false;

  // Events
  @Output() onEdit: EventEmitter<any> = new EventEmitter();
  @Output() onSelect: EventEmitter<boolean> = new EventEmitter();

  // Values
  // appliance!: Appliance;
  editInnerVisible: boolean = false;

  ngOnInit(): void {
    this.defaultAppliance = { ...this.appliance };
    if (this.originalAppliance) this.defaultAppliance = { ...this.originalAppliance };
  }

  editClicked() {
    this.onEdit.emit();
  }

  selectClicked() {
    if (!this.isEditMode) {
      console.log('toggling! Current: ' + this.selected);
      this.selected = !this.selected;
      this.onSelect.emit(this.selected);
    }
  }

  toggleEditMode(event: MouseEvent) {
    event.stopPropagation();
    if (this.isEditMode) {
      if (!this.appliance.name) {
        this.nameRequired = true;
        return;
      }

      // Check and reset to default values if fields are blank or invalid
      if (!this.appliance.quantity) {
        this.appliance.quantity = this.defaultAppliance.quantity;
      }
      if (!this.appliance.wattage) {
        this.appliance.wattage = this.defaultAppliance.wattage;
      }
      if (!this.appliance.hours) {
        this.appliance.hours = this.defaultAppliance.hours;
      }

      this.isEditMode = false;
      this.editInnerVisible = false;
      this.nameRequired = false;
      this.onEdit.emit(this.appliance);
    } else {
      this.isEditMode = true;
      setTimeout(() => {
        this.editInnerVisible = true;
      }, 100);
    }
  }

  validateInput(field: string, value: number) {
    switch (field) {
      case 'quantity':
        this.appliance.quantity = value < 1 ? 1 : value;
        break;
      case 'wattage':
        if (value < 0) {
          this.appliance[field] = 0;
        }
        break;
      case 'hours':
        if (value < 0) {
          this.appliance[field] = 0;
        }
        if (value > 24) {
          this.appliance[field] = 24;
        }
        break;
    }
  }

  setDefaults() {
    // console.log(this.originalAppliance);
    // if (this.originalAppliance) {
    //   this.appliance = { ...this.originalAppliance };
    // } else {
    //   this.appliance = { ...this.defaultAppliance };
    // }
    this.appliance = { ...this.defaultAppliance };
  }

  clearNameError() {
    this.nameRequired = false;
  }
}
