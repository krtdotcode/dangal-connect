import { Injectable, OnDestroy } from '@angular/core';
import { Firestore, doc, setDoc, deleteDoc, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseStorageService implements OnDestroy {
  private sessionId: string;
  private sessionDoc: any;
  private isCleanupIntervalSet = false;

  constructor(private firestore: Firestore) {
    this.sessionId = crypto.randomUUID();
    this.sessionDoc = doc(this.firestore, 'sessions', this.sessionId);
    this.initializeSessionSync();
    this.setupSessionCleanup();
  }

  private initializeSessionSync() {
    // On any sessionStorage change, sync to Firestore
    const originalSetItem = Storage.prototype.setItem;
    const originalRemoveItem = Storage.prototype.removeItem;
    const originalClear = Storage.prototype.clear;

    const self = this;

    Storage.prototype.setItem = function(key: string, value: string) {
      originalSetItem.call(this, key, value);
      if (key === 'dangalConnectUser' || key === 'dangalConnectPreferences') {
        self.syncToFirestore(key, value);
      }
    };

    Storage.prototype.removeItem = function(key: string) {
      originalRemoveItem.call(this, key);
      if (key === 'dangalConnectUser' || key === 'dangalConnectPreferences') {
        self.syncToFirestore(key, null);
      }
    };

    Storage.prototype.clear = function() {
      // Assuming clear removes all, but specifically for our keys
      self.syncToFirestore('dangalConnectUser', null);
      self.syncToFirestore('dangalConnectPreferences', null);
      return originalClear.call(this);
    };

    // Initially sync existing data
    const userData = sessionStorage.getItem('dangalConnectUser');
    if (userData) {
      this.syncToFirestore('dangalConnectUser', userData);
    }
    const prefs = sessionStorage.getItem('dangalConnectPreferences');
    if (prefs) {
      this.syncToFirestore('dangalConnectPreferences', prefs);
    }
  }

  private async syncToFirestore(key: string, value: any) {
    if (key === 'dangalConnectUser' && value === null) {
      await deleteDoc(this.sessionDoc).then(() => {
        console.log('Session user data deleted from Firestore immediately');
      }).catch((error) => {
        console.error('Error deleting session data:', error);
      });
      return;
    }

    if (key === 'dangalConnectPreferences' && value === null) {
      await deleteDoc(this.sessionDoc).then(() => {
        console.log('Session preferences data deleted from Firestore immediately');
      }).catch((error) => {
        console.error('Error deleting session data:', error);
      });
      return;
    }

    const currentData = await this.getCurrentDoc();
    const dataToSet = {
      ...currentData,
      [key]: value ? JSON.parse(value) : null,
      lastUpdated: new Date().toISOString()
    };
    await setDoc(this.sessionDoc, dataToSet).then(() => {
      console.log('Synced to Firestore:', key);
    }).catch((error) => {
      console.error('Error syncing to Firestore:', error);
    });
  }

  private async getCurrentDoc(): Promise<Record<string, any>> {
    const docSnap = await getDoc(this.sessionDoc);
    return docSnap.exists() ? (docSnap.data() as Record<string, any>) : {};
  }

  private setupSessionCleanup() {
    if (!this.isCleanupIntervalSet) {
      this.isCleanupIntervalSet = true;

      const cleanup = async () => {
        await deleteDoc(this.sessionDoc).then(() => {
          console.log('Session data cleaned up from Firestore');
        }).catch((error) => {
          console.error('Error cleaning up session data:', error);
        });
      };

      // Use beforeunload to clean up on session end
      window.addEventListener('beforeunload', cleanup);
      // Also, pagehide for broader support
      window.addEventListener('pagehide', cleanup);
    }
  }

  ngOnDestroy() {
    // Cleanup instantly when service destroyed, but since it's singleton, use above
  }
}
