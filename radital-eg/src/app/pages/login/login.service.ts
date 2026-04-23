// ─────────────────────────────────────────────────────────────────────────────
// login.service.ts  –  Auth API calls for the Login component
//
// Endpoints used:
//   POST /api/Auth/login     → LoginRequestDto  → LoginResponseDto (token)
//   POST /api/Auth/register  → RegisterStaffMemberDto → 200 OK
// ─────────────────────────────────────────────────────────────────────────────
import { Injectable } from '@angular/core';
import { Router }     from '@angular/router';

import { AuthService }            from '../../auth.service';
import {
  LoginRequestDto,
  LoginResponseDto,
  RegisterStaffMemberDto,
  RolesEnum,
} from '../../models';
// Change this to match your ASP.NET host:
const API_BASE = 'http://localhost:5000';

@Injectable({ providedIn: 'root' })
export class LoginService {

  constructor(
    private auth:   AuthService,
    private router: Router,
  ) {}

  // ── login ─────────────────────────────────────────────────────────────────

  /**
   * Authenticates the user.
   * On success the JWT is stored in localStorage via AuthService and the user
   * is redirected to the correct dashboard based on their role.
   *
   * @throws Error with a user-facing message on failure
   */
  async login(employeeId: string, password: string): Promise<void> {
    const body: LoginRequestDto = { loginId: employeeId, password };

    const response = await fetch(`${API_BASE}/api/Auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });

    if (!response.ok) {
      const detail = await this.extractErrorMessage(response);
      throw new Error(detail ?? 'Invalid credentials. Please try again.');
    }

    const data: LoginResponseDto = await response.json();

    // Persist token + user info
    this.auth.saveSession(data);

    // Route to the right dashboard based on role
    this.redirectByRole(data.role);
  }

  // ── register (Request System Access) ──────────────────────────────────────

  /**
   * Registers a new staff member account.
   * Used by the "Request System Access" button.
   *
   * @throws Error with a user-facing message on failure
   */
  async register(dto: RegisterStaffMemberDto): Promise<void> {
    const response = await fetch(`${API_BASE}/api/Auth/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(dto),
    });

    if (!response.ok) {
      const detail = await this.extractErrorMessage(response);
      throw new Error(detail ?? 'Registration failed. Please contact IT support.');
    }
    // Server returns 200 OK with no body — nothing to parse
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private redirectByRole(role: RolesEnum): void {
    switch (role) {
      case RolesEnum.Technician:
        this.router.navigate(['/technician-dashboard']);
        break;
      case RolesEnum.Radiologist:
        this.router.navigate(['/reporting']);
        break;
      default:
        // Admin / Physician / Nurse / Receptionist → generic dashboard
        this.router.navigate(['/dashboard']);
    }
  }

  private async extractErrorMessage(response: Response): Promise<string | null> {
    try {
      const problem = await response.json();
      return problem?.detail ?? problem?.title ?? null;
    } catch {
      return null;
    }
  }
}