import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewChecked, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ChatMatchingService } from '../chat-matching.service';

export interface User {
  department: string;
  program: string;
  year: string;
}

export interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chat-container',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './chat-container.html',
  styleUrl: './chat-container.scss',
})
export class ChatContainer implements AfterViewChecked, OnInit, OnChanges {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  @Input() connectedUser: User = { department: '', program: '', year: '' };
  @Input() messages: Message[] = [];
  @Input() newMessage: string = '';

  @Output() endChat = new EventEmitter<void>();
  @Output() sendMessage = new EventEmitter<string>();
  @Output() messageChange = new EventEmitter<string>();

  localMessage: string = '';
  private shouldScrollToBottom = false;

  constructor(public chatMatching: ChatMatchingService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['newMessage'] && changes['newMessage'].currentValue === '') {
      this.localMessage = '';
    }
    if (changes['messages']) {
      // Auto-scroll when messages change (new message added)
      this.shouldScrollToBottom = true;
    }
  }

  ngOnInit() {
    // Auto-scroll will happen in ngAfterViewChecked when ViewChild is ready
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  getDepartmentBgClass(): string {
    const departmentClasses: { [key: string]: string } = {
      'College of Arts and Sciences': 'bg-dept-maroon', // Maroon
      'College of Business, Accountancy and Administration': 'bg-dept-yellow', // Yellow
      'College of Computing Studies': 'bg-dept-orange', // Orange
      'College of Education': 'bg-dept-blue', // Blue
      'College of Engineering': 'bg-dept-red', // Red
      'College of Health and Allied Sciences': 'bg-dept-green' // Green
    };
    return departmentClasses[this.connectedUser.department] || '';
  }

  onSendMessage() {
    if (this.localMessage.trim()) {
      this.sendMessage.emit(this.localMessage.trim());
      this.localMessage = '';
      this.shouldScrollToBottom = true;
    }
  }

  onMessageChange(value: string) {
    this.messageChange.emit(value);
  }

  onEndChat() {
    this.endChat.emit();
  }

  private scrollToBottom(): void {
    try {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
}
