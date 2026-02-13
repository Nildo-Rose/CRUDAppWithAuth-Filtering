import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  template: `
    <div class="auth-page">
      <div class="auth-card card">
        <h1>Log in</h1>
        <p class="sub">Sign in to manage your projects and tasks.</p>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" type="email" formControlName="email" placeholder="you@example.com" />
            <div class="error" *ngIf="form.get('email')?.invalid && form.get('email')?.touched">
              Valid email required
            </div>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input id="password" type="password" formControlName="password" placeholder="••••••••" />
            <div class="error" *ngIf="form.get('password')?.invalid && form.get('password')?.touched">
              Password required
            </div>
          </div>
          <div class="error" *ngIf="error">{{ error }}</div>
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid || loading">
            {{ loading ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>
        <p class="footer">Don't have an account? <a routerLink="/register">Register</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { display: flex; justify-content: center; align-items: center; min-height: 60vh; padding: 2rem; }
    .auth-card { width: 100%; max-width: 380px; }
    .auth-card h1 { margin: 0 0 0.25rem 0; font-size: 1.5rem; }
    .sub { color: var(--text-muted); margin: 0 0 1.5rem 0; font-size: 0.95rem; }
    .auth-card .btn { width: 100%; margin-top: 0.5rem; }
    .footer { margin-top: 1.25rem; text-align: center; color: var(--text-muted); font-size: 0.9rem; }
  `],
})
export class LoginComponent {
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  error = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
  ) {}

  onSubmit(): void {
    if (this.form.invalid || this.loading) return;
    this.error = '';
    this.loading = true;
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => {},
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Login failed';
      },
    });
  }
}
