import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-end-chat-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './end-chat-modal.html',
  styleUrl: './end-chat-modal.scss',
})
export class EndChatModal {
  @Input() isVisible = false;

  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  onCancel() {
    this.cancel.emit();
  }

  onConfirm() {
    this.confirm.emit();
  }
}
