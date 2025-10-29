import { Injectable, signal } from '@angular/core';

interface JwtPayload {
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'?: string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';

  readonly isAuthenticated = signal(false);
  readonly isAdmin = signal(false);
  readonly userId = signal<number | null>(null);

  constructor() {
    this.loadFromToken();
  }

  private loadFromToken(): void {
    const token = this.getToken();
    if (token) {
      const payload = this.decodeToken(token);
      if (payload) {
        this.isAuthenticated.set(true);
        this.userId.set(this.extractUserId(payload));
        this.isAdmin.set(this.extractIsAdmin(payload));
      }
    }
  }

  private decodeToken(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded) as JwtPayload;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  private extractUserId(payload: JwtPayload): number | null {
    const nameIdentifier = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    if (nameIdentifier) {
      const userId = parseInt(nameIdentifier, 10);
      return isNaN(userId) ? null : userId;
    }
    return null;
  }

  private extractIsAdmin(payload: JwtPayload): boolean {
    const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    return role?.toLowerCase() === 'admin';
  }

  hasToken(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return token !== null && token.trim().length > 0;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    
    const payload = this.decodeToken(token);
    if (payload) {
      this.isAuthenticated.set(true);
      this.userId.set(this.extractUserId(payload));
      this.isAdmin.set(this.extractIsAdmin(payload));
    }
  }

  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.isAuthenticated.set(false);
    this.isAdmin.set(false);
    this.userId.set(null);
  }
}
