// ─────────────────────────────────────────────────────────────────────────────
// auth.service.ts  –  Token storage & retrieval used by every HTTP service
// ─────────────────────────────────────────────────────────────────────────────
import { Injectable } from '@angular/core';
import { LoginResponseDto } from './models';

const TOKEN_KEY = 'radital_token';
const USER_KEY  = 'radital_user';

@Injectable({ providedIn: 'root' })
export class AuthService {

  // ── Storage helpers ─────────────────────────────────────────────────────

  saveSession(response: LoginResponseDto): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY,  JSON.stringify(response));
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getUser(): LoginResponseDto | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as LoginResponseDto) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  // ── Header helper (used by every service) ───────────────────────────────

  /** Returns the Authorization header object ready to spread into fetch options. */
  authHeaders(): Record<string, string> {
    const token = this.getToken();
    return token
      ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' };
  }
}