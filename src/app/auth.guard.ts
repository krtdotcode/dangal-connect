import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Check if user is authenticated via service
  if (authService.isAuthenticated()) {
    return true;
  }

  // Not logged in, redirect to login
  router.navigate(['/login']);
  return false;
};
