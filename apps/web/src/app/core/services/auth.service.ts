import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => !!this.currentUser() && !!localStorage.getItem('jwt_token'));
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  private apiUrl = 'http://localhost:3000/api';

  constructor() {
    this.loadUser();
  }

  private loadUser(): void {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      this.http.get<{ user: User }>(`${this.apiUrl}/auth/me`).subscribe({
        next: (res) => this.currentUser.set(res.user),
        error: () => {
          localStorage.removeItem('jwt_token');
        }
      });
    }
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
