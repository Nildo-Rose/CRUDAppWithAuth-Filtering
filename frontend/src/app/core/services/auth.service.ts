import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenSignal = signal<string | null>(this.getStoredToken());
  private userSignal = signal<User | null>(null);

  currentUser = computed(() => this.userSignal());

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    const t = this.getStoredToken();
    if (t) this.loadUser();
  }

  private getStoredToken(): string | null {
    return localStorage.getItem('token');
  }

  private get apiBase(): string {
    if (!environment.production && typeof window !== 'undefined') {
      return `${window.location.protocol}//${window.location.hostname}:3000/api`;
    }
    return environment.apiUrl;
  }

  private loadUser(): void {
    this.http.get<User>(`${this.apiBase}/auth/me`).pipe(
      tap((user) => this.userSignal.set(user)),
      catchError(() => {
        this.tokenSignal.set(null);
        localStorage.removeItem('token');
        return of(null);
      }),
    ).subscribe();
  }

  isLoggedIn(): boolean {
    return !!this.tokenSignal();
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  register(email: string, password: string, name: string) {
    return this.http.post<AuthResponse>(`${this.apiBase}/auth/register`, { email, password, name }).pipe(
      tap((res) => {
        localStorage.setItem('token', res.token);
        this.tokenSignal.set(res.token);
        this.userSignal.set(res.user);
        this.router.navigate(['/projects']);
      }),
    );
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.apiBase}/auth/login`, { email, password }).pipe(
      tap((res) => {
        localStorage.setItem('token', res.token);
        this.tokenSignal.set(res.token);
        this.userSignal.set(res.user);
        this.router.navigate(['/projects']);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }
}
