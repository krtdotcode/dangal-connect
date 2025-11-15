import { Component, ViewChild, ElementRef, AfterViewChecked, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from './auth.service';
import { Subscription } from 'rxjs';
import { Login } from './login/login';
import { ConnectionPreferencesComponent } from './connection-preferences/connection-preferences';
declare var bootstrap: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, Login, ConnectionPreferencesComponent],
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
  showEndChatDialog = false;
  private authSubscription!: Subscription;

  // Searching state
  isSearchingConnection = false;

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

    // Listen for startSearchingConnection event from preferences component
    window.addEventListener('startSearchingConnection', () => {
      this.startSearchingConnection();
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private startSearchingConnection(): void {
    // Set searching state to true to show search UI
    this.isSearchingConnection = true;

    // In a real application, this would be handled by the backend matching algorithm
    // For demonstration, we auto-connect after 10 seconds
    setTimeout(() => {
      this.isSearchingConnection = false;
    }, 10000); // 10 seconds
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

  shouldShowChat(): boolean {
    return this.isLoggedIn && this.hasPreferences();
  }

  hasPreferences(): boolean {
    const preferences = sessionStorage.getItem('dangalConnectPreferences');
    return preferences !== null;
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

  showEndChatModal() {
    this.showEndChatDialog = true;
  }

  cancelEndChat() {
    this.showEndChatDialog = false;
  }

  confirmEndChat() {
    // Clear chat state
    this.messages = [];
    this.newMessage = '';

    // Clear preferences to force return to preferences form
    sessionStorage.removeItem('dangalConnectPreferences');

    // Close dialog
    this.showEndChatDialog = false;

    // The component will automatically re-render to show preferences form
    // since hasPreferences() will now return false
  }
}
