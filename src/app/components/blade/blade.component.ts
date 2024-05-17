import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { BladeDetail } from '../../interfaces/BladeDetail';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'Blade',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './blade.component.html',
  styleUrls: ['./blade.component.scss']
})
export class BladeComponent implements OnInit {

  // Required
  @Input() label: string = 'Test';
  @Input() details!: BladeDetail[];
  @Input() selected: boolean = false;

  // Optional
  @Input() allowEdit?: boolean = false;
  @Input() disabled?: boolean = false;
  @Input() iconName?: string = "bi bi-star-fill";

  // Style
  @Input() height?: string = '125px';
  
  // Events
  @Output() onEdit: EventEmitter<any> = new EventEmitter();
  @Output() onSelect: EventEmitter<any> = new EventEmitter();

  public isEditMode: boolean = false;

  ngOnInit(): void {
    if (!this.details || this.details.length === 0) {
      this.details = [
        { label: 'Quantity', value: 1 },
        { label: 'Wattage', value: 2 },
        { label: 'Hours/day', value: 3 }
      ];
    }
  }

  editClicked() {
    this.onEdit.emit();
  }

  selectClicked() {
    if (!this.isEditMode){
      this.selected = !this.selected;
      this.onSelect.emit();
    }
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      this.onEdit.emit({ label: this.label, details: this.details });
    }
  }
}
