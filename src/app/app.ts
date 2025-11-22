import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from './auth.service';
import { FirebaseStorageService } from './firebase-storage.service';
import { ChatMatchingService } from './chat-matching.service';
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
  showEndChatDialog = false;
  showChatEndedDialog = false;
  private authSubscription!: Subscription;
  private partnerSubscription!: Subscription;

  // Searching state
  isSearchingConnection = false;

  // Chat matching observables
  partner$;
  messages$;

  constructor(private authService: AuthService, private firebaseStorage: FirebaseStorageService, public chatMatching: ChatMatchingService) {
    this.partner$ = this.chatMatching.currentPartner$;
    this.messages$ = this.chatMatching.messages$;
  }

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

    // Subscribe to partner changes to stop searching when matched and show chat ended when disconnected
    this.partnerSubscription = this.partner$.subscribe(partner => {
      if (this.isSearchingConnection && partner) {
        this.isSearchingConnection = false;
      }
      if (partner === null && this.isLoggedIn && this.hasPreferences()) {
        this.showChatEndedDialog = true;
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
    if (this.partnerSubscription) {
      this.partnerSubscription.unsubscribe();
    }
  }

  private startSearchingConnection(): void {
    // Set searching state to true to show search UI
    this.isSearchingConnection = true;

    // Get user and preferences
    const user = this.authService.getCurrentUser();
    const prefsString = sessionStorage.getItem('dangalConnectPreferences');
    const preferences = prefsString ? JSON.parse(prefsString) : {};

    if (user && preferences) {
      this.chatMatching.startMatching(user, preferences);
    } else {
      this.isSearchingConnection = false;
    }
  }

  onSendMessage(message: string) {
    if (message.trim() && this.chatMatching.currentChatRoomId) {
      this.chatMatching.sendMessage(message, this.chatMatching.sessionId);
    }
  }

  onMessageChange(value: string) {
    // Not needed for now, service handles
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
    this.chatMatching.endChat();
    // Close end chat dialog and show chat ended dialog
    this.showEndChatDialog = false;
    this.showChatEndedDialog = true;
  }

  proceedToConnectAgain() {
    // Clear chat state
    this.showChatEndedDialog = false;

    // Clear preferences to force return to preferences form
    sessionStorage.removeItem('dangalConnectPreferences');

    // The component will automatically re-render to show preferences form
    // since hasPreferences() will now return false
  }
}
