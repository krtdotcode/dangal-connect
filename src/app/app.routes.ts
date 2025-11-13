import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./login/login').then(m => m.Login) },
  { path: 'chat', redirectTo: '/', pathMatch: 'full' } // Redirect chat to root (handled by app component)
];
