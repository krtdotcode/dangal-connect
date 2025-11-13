import { Component, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements AfterViewChecked {
  protected readonly title = signal('dangal-connect');

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  // Mock connected user data - in real app this would come from auth service
  connectedUser = {
    department: 'College of Computing Studies',
    program: 'Bachelor of Science in Computer Science',
    year: '3rd Year'
  };

  messages: any[] = [];
  private shouldScrollToBottom = false;

  newMessage = '';

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.messages.push({
        id: this.messages.length + 1,
        text: this.newMessage.trim(),
        sender: 'user',
        timestamp: new Date()
      });
      this.newMessage = '';
      this.shouldScrollToBottom = true;
    }
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
