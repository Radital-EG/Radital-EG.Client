// ─────────────────────────────────────────────────────────────────────────────
// technician-dashboard.service.ts
//
// Sits between TechnicianDashboardComponent and ReportingRequestService.
// Responsibilities:
//   • Fetch the full list from the API
//   • Map API DTOs → the component's local Request shape
//   • Derive stats (avg turnaround is not yet served by the API, so it stays
//     as a placeholder until a stats endpoint is added)
//   • Expose a reload() helper for polling / pull-to-refresh
// ─────────────────────────────────────────────────────────────────────────────
import { Injectable } from '@angular/core';

import { ReportingRequestService }  from '../imaging-request/reporting-request.service'; 
import { ReportingRequestResponseDto, ReportingRequestStatusEnum, ImageModalitiesEnum } from '../../models';

import { Request, RequestStatus, ProgressStep } from './technician-dashboard';

// ── Mapping helpers ────────────────────────────────────────────────────────

const STATUS_MAP: Record<ReportingRequestStatusEnum, RequestStatus> = {
  [ReportingRequestStatusEnum.Pending]:   'PENDING',
  [ReportingRequestStatusEnum.InReview]:  'IN REVIEW',
  [ReportingRequestStatusEnum.Completed]: 'COMPLETED',
  [ReportingRequestStatusEnum.Escalated]: 'ESCALATED',
};

const PROGRESS_MAP: Record<ReportingRequestStatusEnum, ProgressStep> = {
  [ReportingRequestStatusEnum.Pending]:   'SUBMITTED',
  [ReportingRequestStatusEnum.InReview]:  'PROCESSING',
  [ReportingRequestStatusEnum.Completed]: 'COMPLETED',
  [ReportingRequestStatusEnum.Escalated]: 'FINALIZING',
};

const MODALITY_LABEL: Record<ImageModalitiesEnum, string> = {
  [ImageModalitiesEnum.CT]:         'CT',
  [ImageModalitiesEnum.MRI]:        'MRI',
  [ImageModalitiesEnum.XRay]:       'X-Ray',
  [ImageModalitiesEnum.Ultrasound]: 'Ultrasound',
};

function toInitials(name: string | null): string {
  if (!name) return '??';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

function formatSubmissionTime(isoString: string): string {
  const date  = new Date(isoString);
  const today = new Date();
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth()    === today.getMonth()    &&
    date.getDate()     === today.getDate();

  const timeStr = date.toLocaleTimeString('en-US', {
    hour:   '2-digit',
    minute: '2-digit',
  });
  return isToday ? `Today, ${timeStr}` : `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${timeStr}`;
}

function dtoToRequest(dto: ReportingRequestResponseDto): Request {
  const modality     = MODALITY_LABEL[dto.imageModality] ?? 'Unknown';
  const department   = dto.suggestedDepartment ? ` ${dto.suggestedDepartment}` : '';

  return {
    id:               `#${dto.id.substring(0, 7).toUpperCase()}`,
    patientInitials:  toInitials(dto.patientName),
    patientName:      dto.patientName ?? 'Unknown Patient',
    modality:         `${modality}${department}`.trim(),
    submissionTime:   formatSubmissionTime(dto.submissionTime),
    status:           STATUS_MAP[dto.status] ?? 'PENDING',
    expanded:         false,
    assignedTo:       dto.assignedRadiologistName ?? undefined,
    progress:         PROGRESS_MAP[dto.status]    ?? 'SUBMITTED',
    // Store the real UUID for detail-panel API calls
    uuid:             dto.id,
  };
}

// ── Service ─────────────────────────────────────────────────────────────────

export interface DashboardStats {
  avgTurnaround:   string;
  avgTrend:        string;
  urgentPending:   string;
  reportsToday:    string;
  reportsTarget:   string;
  reportsPercent:  number;
}

@Injectable({ providedIn: 'root' })
export class TechnicianDashboardService {

  constructor(private requestApi: ReportingRequestService) {}

  /**
   * Loads all requests from the API and maps them to the component's
   * Request interface. Throws on network/auth errors.
   */
  async loadRequests(): Promise<Request[]> {
    const dtos = await this.requestApi.getAll();
    return dtos.map(dtoToRequest);
  }

  /**
   * Refreshes a single row after the technician expands it.
   * Merges fresh data into the existing array in-place so the UI doesn't jump.
   */
  async refreshRow(requests: Request[], uuid: string): Promise<void> {
    const dto = await this.requestApi.getById(uuid);
    const idx = requests.findIndex(r => r.uuid === uuid);
    if (idx === -1) return;

    const updated = dtoToRequest(dto);
    // Preserve expanded state that the user set locally
    updated.expanded = requests[idx].expanded;
    requests[idx]    = updated;
  }

  /**
   * Derives summary stats from the loaded requests array.
   * avgTurnaround is not yet available from the API, so it stays as a display
   * placeholder — replace when the backend exposes a stats endpoint.
   */
  deriveStats(requests: Request[]): DashboardStats {
    const urgentCount = requests.filter(
      r => r.status === 'PENDING' || r.status === 'ESCALATED'
    ).length;

    const completedToday = requests.filter(
      r => r.status === 'COMPLETED' && r.submissionTime.startsWith('Today')
    ).length;

    return {
      avgTurnaround:  '— m — s',         // placeholder: no API endpoint yet
      avgTrend:       'N/A',
      urgentPending:  String(urgentCount),
      reportsToday:   String(completedToday),
      reportsTarget:  '15',
      reportsPercent: Math.round((completedToday / 15) * 100),
    };
  }
}