import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';

  readonly isAuthenticated = signal(this.hasToken());

  hasToken(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return token !== null && token.trim().length > 0;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.isAuthenticated.set(true);
  }

  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.isAuthenticated.set(false);
  }
}
