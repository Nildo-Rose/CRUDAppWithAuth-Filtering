import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'projects', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent) },
  {
    path: 'projects',
    loadComponent: () => import('./projects/project-list/project-list.component').then(m => m.ProjectListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'projects/new',
    loadComponent: () => import('./projects/project-form/project-form.component').then(m => m.ProjectFormComponent),
    canActivate: [authGuard],
  },
  {
    path: 'projects/:id',
    loadComponent: () => import('./projects/project-detail/project-detail.component').then(m => m.ProjectDetailComponent),
    canActivate: [authGuard],
  },
  {
    path: 'projects/:id/edit',
    loadComponent: () => import('./projects/project-form/project-form.component').then(m => m.ProjectFormComponent),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'projects' },
];
