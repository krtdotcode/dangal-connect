import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from './auth.service';
import { Subscription } from 'rxjs';
import { Login } from './login/login';
import { ConnectionPreferencesComponent } from './connection-preferences/connection-preferences';
import { SearchContainer } from './search-container/search-container';
import { ChatContainer } from './chat-container/chat-container';
import { EndChatModal } from './end-chat-modal/end-chat-modal';
import { ChatEndedModal } from './chat-ended-modal/chat-ended-modal';

declare var bootstrap: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    Login,
    ConnectionPreferencesComponent,
    SearchContainer,
    ChatContainer,
    EndChatModal,
    ChatEndedModal
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'

})
export class App implements OnInit, OnDestroy {

  isLoggedIn = false;
  connectedUser = { department: '', program: '', year: '' };
  messages: any[] = [];
  newMessage = '';
  showEndChatDialog = false;
  showChatEndedDialog = false;
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

  onSendMessage(message: string) {
    if (message.trim()) {
      this.messages.push({
        id: this.messages.length + 1,
        text: message.trim(),
        sender: 'user',
        timestamp: new Date()
      });
      this.newMessage = '';
    }
  }

  onMessageChange(value: string) {
    this.newMessage = value;
  }

  onEndChat() {
    this.showEndChatModal();
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
    // Close end chat dialog and show chat ended dialog
    this.showEndChatDialog = false;
    this.showChatEndedDialog = true;
  }

  proceedToConnectAgain() {
    // Clear chat state
    this.messages = [];
    this.newMessage = '';

    // Clear preferences to force return to preferences form
    sessionStorage.removeItem('dangalConnectPreferences');

    // Close dialog
    this.showChatEndedDialog = false;

    // The component will automatically re-render to show preferences form
    // since hasPreferences() will now return false
  }
}
