import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf],
  template: `
    <div class="app-shell">
      <header class="header" *ngIf="auth.isLoggedIn()">
        <div class="container header-inner">
          <a routerLink="/projects" class="logo">Projects & Tasks</a>
          <nav>
            <a routerLink="/projects" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Projects</a>
            <span class="user">{{ auth.currentUser()?.name }}</span>
            <button type="button" class="btn btn-secondary" (click)="auth.logout()">Log out</button>
          </nav>
        </div>
      </header>
      <main class="main">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .app-shell { min-height: 100vh; display: flex; flex-direction: column; }
    .header { border-bottom: 1px solid var(--border); background: var(--surface); }
    .header-inner { display: flex; align-items: center; justify-content: space-between; padding-top: 0.75rem; padding-bottom: 0.75rem; }
    .logo { font-weight: 700; font-size: 1.15rem; color: var(--text); }
    .logo:hover { text-decoration: none; color: var(--accent); }
    nav { display: flex; align-items: center; gap: 1.25rem; }
    nav a { color: var(--text-muted); }
    nav a.active { color: var(--accent); }
    .user { color: var(--text-muted); font-size: 0.9rem; }
    .main { flex: 1; padding: 1.5rem 0; }
  `],
})
export class AppComponent {
  constructor(public auth: AuthService) {}
}
