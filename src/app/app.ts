import { Component, signal, ViewChild, ElementRef, AfterViewChecked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements AfterViewChecked, OnInit {
  protected readonly title = signal('dangal-connect');

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  isLoggedIn = false;
  connectedUser = {
    department: '',
    program: '',
    year: ''
  };

  messages: any[] = [];
  private shouldScrollToBottom = false;

  newMessage = '';

  ngOnInit() {
    this.checkLoginStatus();
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  private checkLoginStatus() {
    const userData = sessionStorage.getItem('dangalConnectUser');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.isLoggedIn) {
          this.isLoggedIn = true;
          this.connectedUser = {
            department: user.department,
            program: user.program,
            year: user.year
          };
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.clearSession();
      }
    }
  }

  private clearSession() {
    sessionStorage.removeItem('dangalConnectUser');
    this.isLoggedIn = false;
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
