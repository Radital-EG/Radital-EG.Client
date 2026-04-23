// ─────────────────────────────────────────────────────────────────────────────
// reporting-request.service.ts  –  ReportingRequests API for ALL components
//
// Endpoints used:
//   POST   /api/ReportingRequests       → create a new request
//   GET    /api/ReportingRequests       → get all requests (technician list)
//   GET    /api/ReportingRequests/{id}  → get single request
// ─────────────────────────────────────────────────────────────────────────────
import { Injectable } from '@angular/core';

import { AuthService } from '../../auth.service'; 
import {
  CreateReportingRequestDto,
  ReportingRequestResponseDto,
} from '../../models'; 
const API_BASE = 'http://localhost:5000';

@Injectable({ providedIn: 'root' })
export class ReportingRequestService {

  constructor(private auth: AuthService) {}

  // ── GET all ──────────────────────────────────────────────────────────────

  /**
   * Fetches every reporting request the current user is authorised to see.
   * Used by the technician dashboard to populate the table.
   */
  async getAll(): Promise<ReportingRequestResponseDto[]> {
    const response = await fetch(`${API_BASE}/api/ReportingRequests`, {
      method:  'GET',
      headers: this.auth.authHeaders(),
    });

    await this.assertOk(response);
    return response.json() as Promise<ReportingRequestResponseDto[]>;
  }

  // ── GET by id ─────────────────────────────────────────────────────────────

  /**
   * Fetches a single request by UUID.
   * Useful when the technician expands a row and needs fresh data.
   */
  async getById(id: string): Promise<ReportingRequestResponseDto> {
    const response = await fetch(`${API_BASE}/api/ReportingRequests/${id}`, {
      method:  'GET',
      headers: this.auth.authHeaders(),
    });

    await this.assertOk(response);
    return response.json() as Promise<ReportingRequestResponseDto>;
  }

  // ── POST (create) ────────────────────────────────────────────────────────

  /**
   * Submits a new imaging request.
   * Used by ImagingRequestComponent on "Submit Request".
   * Returns the created resource (201 Created).
   */
  async create(dto: CreateReportingRequestDto): Promise<ReportingRequestResponseDto> {
    const response = await fetch(`${API_BASE}/api/ReportingRequests`, {
      method:  'POST',
      headers: this.auth.authHeaders(),
      body:    JSON.stringify(dto),
    });

    await this.assertOk(response, [201]);
    return response.json() as Promise<ReportingRequestResponseDto>;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /**
   * Throws a descriptive Error when the HTTP status is not in `allowed`.
   * Tries to parse ProblemDetails from the body for a user-friendly message.
   */
  private async assertOk(
    response: Response,
    allowed: number[] = [200],
  ): Promise<void> {
    if (allowed.includes(response.status)) return;

    let message = `HTTP ${response.status}`;
    try {
      const problem = await response.json();
      message = problem?.detail ?? problem?.title ?? message;
    } catch { /* body was not JSON */ }

    throw new Error(message);
  }
}