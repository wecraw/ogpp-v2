import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppliancePreset } from '../../interfaces/AppliancePreset';

@Component({
  selector: 'preset-card',
  imports: [CommonModule],
  templateUrl: './preset-card.component.html',
  styleUrl: './preset-card.component.scss'
})
export class PresetCardComponent {
  @Input() preset!: AppliancePreset;
  @Input() selected: boolean = false;

  @Output() onSelect: EventEmitter<AppliancePreset> = new EventEmitter();

  selectClicked() {
    this.onSelect.emit(this.preset);
  }
}
