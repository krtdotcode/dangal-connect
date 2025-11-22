import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { FirebaseStorageService } from './firebase-storage.service';

export interface User {
  department: string;
  program: string;
  year: string;
  isLoggedIn: boolean;
  loginTime: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private router: Router, private firebaseStorage: FirebaseStorageService) {
    this.checkInitialAuthState();
    this.monitorStorageChanges();
  }

  private checkInitialAuthState() {
    const userData = sessionStorage.getItem('dangalConnectUser');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.isLoggedIn) {
          this.currentUserSubject.next(user);
          return;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.clearSession();
      }
    }
    this.currentUserSubject.next(null);
  }

  private monitorStorageChanges() {
    // Listen for storage changes (including manual deletion)
    window.addEventListener('storage', (event) => {
      if (event.key === 'dangalConnectUser') {
        if (event.newValue === null) {
          // Session storage was cleared
          this.currentUserSubject.next(null);
          if (this.router.url !== '/login') {
            this.router.navigate(['/login']);
          }
        } else {
          // Session storage was updated
          try {
            const user = JSON.parse(event.newValue);
            if (user.isLoggedIn) {
              this.currentUserSubject.next(user);
            } else {
              this.currentUserSubject.next(null);
              if (this.router.url !== '/login') {
                this.router.navigate(['/login']);
              }
            }
          } catch (error) {
            this.clearSession();
          }
        }
      }
    });
  }

  login(department: string, program: string, year: string) {
    const user: User = {
      department,
      program,
      year,
      isLoggedIn: true,
      loginTime: new Date().toISOString()
    };

    sessionStorage.setItem('dangalConnectUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  logout() {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  private clearSession() {
    sessionStorage.removeItem('dangalConnectUser');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    const user = this.currentUserSubject.value;
    return user !== null && user.isLoggedIn;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
