import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent implements OnInit {
  @Input() modalContent: string = '';
  @Input() modalHeader: string = '';
  @Output() closeModal = new EventEmitter<void>();
  formattedContent: string = '';

  ngOnInit() {
    this.formattedContent = this.modalContent.replace(/\n/g, '<br>');
  }
  dismiss() {
    this.closeModal.emit();
  }
}
