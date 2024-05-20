import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { BladeDetail } from '../../interfaces/BladeDetail';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'appliance-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appliance-card.component.html',
  styleUrls: ['./appliance-card.component.scss']
})
export class ApplianceCardComponent {
  // Required
  @Input() name: string = 'Name';
  @Input() description: string = 'Description';
  @Input() selected: boolean = false;
  @Input() wattage: number = 0;
  @Input() hours: number = 0;
  @Input() quantity: number = 1;

  // Optional
  @Input() disabled?: boolean = false;
  @Input() iconName?: string = 'bi-lightbulb';

  // Events
  @Output() onEdit: EventEmitter<any> = new EventEmitter();
  @Output() onSelect: EventEmitter<any> = new EventEmitter();

  public isEditMode: boolean = false;

  ngOnInit(): void {}

  editClicked() {
    this.onEdit.emit();
  }

  selectClicked() {
    if (!this.isEditMode) {
      this.selected = !this.selected;
      this.onSelect.emit();
    }
  }

  toggleEditMode(event: MouseEvent) {
    event.stopPropagation();
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      this.onEdit.emit({
        name: this.name,
        description: this.description,
        wattage: this.wattage,
        hours: this.hours,
        quantity: this.quantity
      });
    }
  }

  validateInput(field: string, value: number) {
    switch (field) {
      case 'quantity':
        this.quantity = value < 1 ? 1 : value;
        break;
      case 'wattage':
      case 'hours':
        if (value < 0) {
          this[field] = 0;
        }
        break;
    }
  }

  resetFields() {
    // TODO: actually get defaults from the item set

    this.quantity = 1;
    this.hours = 0;
    this.wattage = 0;
  }
}
