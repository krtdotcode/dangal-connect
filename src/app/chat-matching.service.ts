import { Injectable, OnDestroy } from '@angular/core';
import { Firestore, doc, collection, addDoc, setDoc, getDoc, updateDoc, deleteDoc, getDocs, query, where, onSnapshot, arrayUnion } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

export interface ActiveUser {
  sessionId: string;
  user: any;
  preferences: any;
  isMatching: boolean;
  partnerSession?: string;
  isInChat: boolean;
  chatRoomId?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  timestamp: any;
}

@Injectable({
  providedIn: 'root'
})
export class ChatMatchingService implements OnDestroy {
  currentPartner$ = new BehaviorSubject<ActiveUser | null>(null);
  messages$ = new BehaviorSubject<ChatMessage[]>([]);
  sessionId: string;
  currentChatRoomId: string | null = null;

  private unsubscribe: any;
  private chatUnsubscribe: any;
  private matchingInterval: any;
  private isMatching = false;

  constructor(private firestore: Firestore) {
    this.sessionId = crypto.randomUUID();
    this.setupOfflineCleanup();
    this.listenForSessionChanges();
  }

  async startMatching(user: any, preferences: any) {
    this.isMatching = true;
    const activeUser: ActiveUser = {
      sessionId: this.sessionId,
      user,
      preferences,
      isMatching: true,
      isInChat: false
    };
    await setDoc(doc(this.firestore, 'activeUsers', this.sessionId), activeUser);

    // Listen for changes
    this.unsubscribe = onSnapshot(doc(this.firestore, 'activeUsers', this.sessionId), doc => {
      const data = doc.data() as ActiveUser;
      if (data && data.isInChat && data.partnerSession && data.chatRoomId) {
        if (this.matchingInterval) {
          clearInterval(this.matchingInterval);
          this.matchingInterval = null;
        }
        this.startChat(data.chatRoomId, data.partnerSession);
      }
    });

    // Try to find a match initially
    const match = await this.findMatch(preferences);
    if (match) {
      await this.performMatch(match);
      if (this.matchingInterval) {
        clearInterval(this.matchingInterval);
        this.matchingInterval = null;
      }
    } else {
      // Poll for match
      this.matchingInterval = setInterval(async () => {
        if (!this.isMatching || this.currentPartner$.value) return;
        const match = await this.findMatch(preferences);
        if (match) {
          await this.performMatch(match);
          clearInterval(this.matchingInterval);
          this.matchingInterval = null;
        }
      }, 3000);
    }
  }

  private async findMatch(preferences: any): Promise<ActiveUser | null> {
    const q = query(collection(this.firestore, 'activeUsers'), where('isMatching', '==', true));
    const querySnapshot = await getDocs(q);
    const activeUsers = querySnapshot.docs.map(d => d.data() as ActiveUser);

    return activeUsers.find(u =>
      u.sessionId !== this.sessionId &&
      !u.isInChat &&
      this.preferencesMatch(preferences, u.preferences)
    ) || null;
  }

  private preferencesMatch(a: any, b: any): boolean {
    // Both users must have the same connection preference (both specific or both casual)
    if (a.connectWithAnyone !== b.connectWithAnyone) return false;

    // If both are casual users (connect with anyone), always match
    if (a.connectWithAnyone && b.connectWithAnyone) return true;

    // If both are specific users, check compatibility
    if (!a.connectWithAnyone && !b.connectWithAnyone) {
      // Ensure both have set preferences
      if (!a.preferredDepartment || !b.preferredDepartment) return false;
      if (a.preferredDepartment !== b.preferredDepartment) return false;
      if (a.preferredProgram !== b.preferredProgram) return false;
      // Allow flexible year matching if either user selected "Any Year"
      if (a.preferredYear !== 'Any Year' && b.preferredYear !== 'Any Year' && a.preferredYear !== b.preferredYear) return false;
      return true;
    }

    // Should not reach here, but fail safe
    return false;
  }

  private async performMatch(partner: ActiveUser) {
    const roomId = [this.sessionId, partner.sessionId].sort().join('_');
    const chatData = {
      participants: [this.sessionId, partner.sessionId],
      messages: []
    };
    await setDoc(doc(this.firestore, 'chatRooms', roomId), chatData);

    // Update both users
    await updateDoc(doc(this.firestore, 'activeUsers', this.sessionId), {
      isInChat: true,
      partnerSession: partner.sessionId,
      chatRoomId: roomId
    });
    await updateDoc(doc(this.firestore, 'activeUsers', partner.sessionId), {
      isInChat: true,
      partnerSession: this.sessionId,
      chatRoomId: roomId
    });
  }

  private startChat(roomId: string, partnerSession: string) {
    this.currentChatRoomId = roomId;
    this.chatUnsubscribe = onSnapshot(doc(this.firestore, 'chatRooms', roomId), doc => {
      const data = doc.data() as any;
      if (data && data['messages']) {
        const messages = data['messages'].map((m: any) => ({ ...m, timestamp: m.timestamp.toDate() }));
        this.messages$.next(messages);
      } else if (!data) {
        this.endChat();
      }
    });

    // Get partner data
    getDoc(doc(this.firestore, 'activeUsers', partnerSession)).then(doc => {
      const partner = doc.data() as ActiveUser;
      this.currentPartner$.next(partner);
    });
  }

  async sendMessage(message: string, senderId: string) {
    if (this.currentChatRoomId) {
      const msg: ChatMessage = {
        id: crypto.randomUUID(),
        text: message,
        sender: senderId,
        timestamp: new Date()
      };
      await updateDoc(doc(this.firestore, 'chatRooms', this.currentChatRoomId), {
        messages: arrayUnion(msg)
      });
    }
  }

  async endChat() {
    if (this.currentChatRoomId) {
      await deleteDoc(doc(this.firestore, 'chatRooms', this.currentChatRoomId));
    }
    // Delete the activeUser doc to keep data temporary
    await deleteDoc(doc(this.firestore, 'activeUsers', this.sessionId));
    // No need for updateDoc since we're deleting
    this.currentPartner$.next(null);
    this.messages$.next([]);
    this.isMatching = false;
    this.currentChatRoomId = null;
    if (this.chatUnsubscribe) {
      this.chatUnsubscribe();
    }
    if (this.matchingInterval) {
      clearInterval(this.matchingInterval);
      this.matchingInterval = null;
    }
  }

  private setupOfflineCleanup() {
    const cleanup = () => {
      deleteDoc(doc(this.firestore, 'activeUsers', this.sessionId));
      if (this.currentChatRoomId) {
        deleteDoc(doc(this.firestore, 'chatRooms', this.currentChatRoomId));
      }
    };
    window.addEventListener('beforeunload', cleanup);
    window.addEventListener('pagehide', cleanup);
  }

  private listenForSessionChanges() {
    // Listen for sessionStorage changes
    window.addEventListener('storage', (event) => {
      if (event.key === 'dangalConnectUser' && event.newValue === null && this.isMatching) {
        // User logged out during matching/chat, end the session
        this.endChat();
      }
    });
  }

  ngOnDestroy() {
    if (this.unsubscribe) this.unsubscribe();
    if (this.chatUnsubscribe) this.chatUnsubscribe();
    if (this.matchingInterval) clearInterval(this.matchingInterval);
  }
}
