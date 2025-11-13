import { Component, ViewChild, ElementRef, AfterViewChecked, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from './auth.service';
import { Subscription } from 'rxjs';
import { Login } from './login/login';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, Login],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements AfterViewChecked, OnInit, OnDestroy {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  isLoggedIn = false;
  connectedUser = { department: '', program: '', year: '' };
  messages: any[] = [];
  private shouldScrollToBottom = false;
  newMessage = '';
  private authSubscription!: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Subscribe to authentication state changes
    this.authSubscription = this.authService.currentUser$.subscribe((user: User | null) => {
      this.isLoggedIn = user !== null;
      if (user) {
        this.connectedUser = {
          department: user.department,
          program: user.program,
          year: user.year
        };
      } else {
        this.connectedUser = { department: '', program: '', year: '' };
      }
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

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
