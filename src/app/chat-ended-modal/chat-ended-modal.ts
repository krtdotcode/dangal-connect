import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-ended-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-ended-modal.html',
  styleUrl: './chat-ended-modal.scss',
})
export class ChatEndedModal {
  @Input() isVisible = false;

  @Output() confirm = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }
}
