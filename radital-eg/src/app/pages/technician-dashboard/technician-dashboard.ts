// ─────────────────────────────────────────────────────────────────────────────
// technician-dashboard.ts  –  Updated component wired to TechnicianDashboardService
// ─────────────────────────────────────────────────────────────────────────────
import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';

import { TechnicianDashboardService, DashboardStats } from './technician-dashboard.service';

export type RequestStatus = 'PENDING' | 'IN REVIEW' | 'COMPLETED' | 'ESCALATED';
export type ProgressStep  = 'SUBMITTED' | 'PROCESSING' | 'FINALIZING' | 'COMPLETED';

export interface Request {
  id:               string;
  patientInitials:  string;
  patientName:      string;
  modality:         string;
  submissionTime:   string;
  status:           RequestStatus;
  expanded:         boolean;
  assignedTo?:      string;
  progress:         ProgressStep;
  /** Real UUID used for detail-panel API calls — not displayed. */
  uuid?:            string;
}

@Component({
  selector:    'app-technician-dashboard',
  standalone:  true,
  imports:     [CommonModule, FormsModule],
  templateUrl: './technician-dashboard.html',
  styleUrls:   ['./technician-dashboard.css'],
})
export class TechnicianDashboardComponent implements OnInit {

  // ── UI state ──────────────────────────────────────────────────────────
  activeNav:    string = 'current-cases';
  searchQuery:  string = '';
  dateRange:    string = 'last24h';
  statusFilter: string = 'all';

  isLoading:    boolean = true;
  errorMessage: string  = '';

  navItems = [
    { id: 'dashboard',      label: 'Dashboard',      icon: 'grid'  },
    { id: 'current-cases',  label: 'Current Cases',  icon: 'list'  },
    { id: 'emergency',      label: 'Emergency',      icon: 'alert' },
    { id: 'pending-lab',    label: 'Pending Lab',    icon: 'flask' },
    { id: 'technician-log', label: 'Technician Log', icon: 'user'  },
    { id: 'reports',        label: 'Reports',        icon: 'file'  },
  ];

  progressSteps: ProgressStep[] = ['SUBMITTED', 'PROCESSING', 'FINALIZING', 'COMPLETED'];

  // ── Data ──────────────────────────────────────────────────────────────
  allRequests: Request[] = [];

  stats: DashboardStats = {
    avgTurnaround:  '— m — s',
    avgTrend:       'N/A',
    urgentPending:  '0',
    reportsToday:   '0',
    reportsTarget:  '15',
    reportsPercent: 0,
  };

  constructor(private dashboardService: TechnicianDashboardService) {}

  // ── Lifecycle ─────────────────────────────────────────────────────────

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  async loadData(): Promise<void> {
    this.isLoading    = true;
    this.errorMessage = '';

    try {
      this.allRequests = await this.dashboardService.loadRequests();
      this.stats       = this.dashboardService.deriveStats(this.allRequests);
    } catch (err: unknown) {
      this.errorMessage = err instanceof Error
        ? err.message
        : 'Failed to load requests. Please refresh.';
    } finally {
      this.isLoading = false;
    }
  }

  // ── Filtering ─────────────────────────────────────────────────────────

  get filteredRequests(): Request[] {
    return this.allRequests.filter(r => {
      const matchStatus = this.statusFilter === 'all' ||
        r.status.toLowerCase().replace(' ', '') === this.statusFilter;
      const matchSearch = !this.searchQuery ||
        r.id.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        r.patientName.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }

  resetFilters(): void {
    this.dateRange    = 'last24h';
    this.statusFilter = 'all';
    this.searchQuery  = '';
  }

  // ── Row expand with optional API refresh ──────────────────────────────

  async toggleExpand(req: Request): Promise<void> {
    req.expanded = !req.expanded;

    // When expanding, fetch fresh detail data if we have the UUID
    if (req.expanded && req.uuid) {
      try {
        await this.dashboardService.refreshRow(this.allRequests, req.uuid);
      } catch {
        // Non-fatal: the row stays expanded with the data we already have
      }
    }
  }

  // ── Progress helpers ──────────────────────────────────────────────────

  getStepIndex(step: ProgressStep): number {
    return this.progressSteps.indexOf(step);
  }

  isStepDone(req: Request, step: ProgressStep): boolean {
    return this.getStepIndex(req.progress) >= this.getStepIndex(step);
  }

  isStepActive(req: Request, step: ProgressStep): boolean {
    return req.progress === step;
  }
}