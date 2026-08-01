import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => !!localStorage.getItem('jwt_token'));
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  private apiUrl = '/api';
  private initPromise: Promise<void> | null = null;

  /**
   * Called by APP_INITIALIZER. Blocks app boot until the stored token
   * is validated against /api/auth/me, so route guards see the correct
   * auth state synchronously.
   */
  async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      this.initPromise = Promise.resolve();
      return this.initPromise;
    }
    this.initPromise = lastValueFrom(
      this.http.get<User>(`${this.apiUrl}/auth/me`)
    ).then((user) => {
      this.currentUser.set(user);
    }).catch(() => {
      localStorage.removeItem('jwt_token');
    });
    return this.initPromise;
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${this.apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Login failed');
    }
    const data = await res.json();
    localStorage.setItem('jwt_token', data.token);
    this.currentUser.set(data.user);
    return data;
  }

  async register(orgName: string, userName: string, email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${this.apiUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgName, userName, email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Registration failed');
    }
    const data = await res.json();
    localStorage.setItem('jwt_token', data.token);
    this.currentUser.set(data.user);
    return data;
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
