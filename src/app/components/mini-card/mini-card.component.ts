import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'mini-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mini-card.component.html',
  styleUrl: './mini-card.component.scss'
})
export class MiniCardComponent {
  @Input() disabled?: boolean = false;
  @Input() selected: boolean = false;
  @Input() label: string = 'Label';
  @Input() iconName: string = 'bi-pencil';

  @Output() onSelect: EventEmitter<boolean> = new EventEmitter();

  selectClicked() {
    this.selected = !this.selected;
    this.onSelect.emit(this.selected);
  }
}
