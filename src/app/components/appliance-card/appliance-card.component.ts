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
  @Input() defaultAppliance!: Appliance;

  // State
  @Input() disabled?: boolean = false;
  @Input() selected: boolean = false;
  public isEditMode: boolean = false;

  // Events
  @Output() onEdit: EventEmitter<any> = new EventEmitter();
  @Output() onSelect: EventEmitter<boolean> = new EventEmitter();

  // Values
  appliance!: Appliance;

  ngOnInit(): void {
    this.setDefaults();
  }

  editClicked() {
    this.onEdit.emit();
  }

  selectClicked() {
    if (!this.isEditMode) {
      this.selected = !this.selected;
      this.onSelect.emit(this.selected);
    }
  }

  toggleEditMode(event: MouseEvent) {
    event.stopPropagation();
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      this.onEdit.emit(this.appliance);
    }
  }

  validateInput(field: string, value: number) {
    switch (field) {
      case 'quantity':
        this.appliance.quantity = value < 1 ? 1 : value;
        break;
      case 'wattage':
      case 'hours':
        if (value < 0) {
          this.appliance[field] = 0;
        }
        break;
    }
  }

  setDefaults() {
    this.appliance = this.defaultAppliance;
  }
}