import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type RequestStatus = 'PENDING' | 'IN REVIEW' | 'COMPLETED' | 'ESCALATED';
export type ProgressStep = 'SUBMITTED' | 'PROCESSING' | 'FINALIZING' | 'COMPLETED';

export interface Request {
  id: string;
  patientInitials: string;
  patientName: string;
  modality: string;
  submissionTime: string;
  status: RequestStatus;
  expanded: boolean;
  assignedTo?: string;
  progress: ProgressStep;
}

@Component({
  selector: 'app-technician-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './technician-dashboard.html',
  styleUrls: ['./technician-dashboard.css']
})
export class TechnicianDashboardComponent {
  activeNav: string = 'current-cases';
  searchQuery: string = '';
  dateRange: string = 'last24h';
  statusFilter: string = 'all';

  navItems = [
    { id: 'dashboard',     label: 'Dashboard',     icon: 'grid' },
    { id: 'current-cases', label: 'Current Cases',  icon: 'list' },
    { id: 'emergency',     label: 'Emergency',      icon: 'alert' },
    { id: 'pending-lab',   label: 'Pending Lab',    icon: 'flask' },
    { id: 'technician-log',label: 'Technician Log', icon: 'user' },
    { id: 'reports',       label: 'Reports',        icon: 'file' },
  ];

  progressSteps: ProgressStep[] = ['SUBMITTED', 'PROCESSING', 'FINALIZING', 'COMPLETED'];

  allRequests: Request[] = [
    {
      id: '#REQ-001',
      patientInitials: 'HS',
      patientName: 'Hanna Scholl',
      modality: 'MRI Lumbar',
      submissionTime: 'Today, 09:12 AM',
      status: 'PENDING',
      expanded: false,
      progress: 'SUBMITTED'
    },
    {
      id: '#REQ-002',
      patientInitials: 'MJ',
      patientName: 'Marcus Jensen',
      modality: 'CT Chest',
      submissionTime: 'Today, 08:45 AM',
      status: 'IN REVIEW',
      expanded: true,
      assignedTo: 'Dr. Sarah Miller',
      progress: 'FINALIZING'
    },
    {
      id: '#REQ-003',
      patientInitials: 'LW',
      patientName: 'Linda Wu',
      modality: 'X-Ray Femur',
      submissionTime: 'Today, 07:15 AM',
      status: 'COMPLETED',
      expanded: false,
      progress: 'COMPLETED'
    },
  ];

  stats = {
    avgTurnaround: '42m 15s',
    avgTrend: '-12% from yesterday',
    urgentPending: '6',
    reportsToday: '14',
    reportsTarget: '15',
    reportsPercent: 76
  };

  get filteredRequests(): Request[] {
    return this.allRequests.filter(r => {
      const matchStatus = this.statusFilter === 'all' || r.status.toLowerCase().replace(' ', '') === this.statusFilter;
      const matchSearch = !this.searchQuery ||
        r.id.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        r.patientName.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }

  toggleExpand(req: Request): void {
    req.expanded = !req.expanded;
  }

  getStepIndex(step: ProgressStep): number {
    return this.progressSteps.indexOf(step);
  }

  isStepDone(req: Request, step: ProgressStep): boolean {
    return this.getStepIndex(req.progress) >= this.getStepIndex(step);
  }

  isStepActive(req: Request, step: ProgressStep): boolean {
    return req.progress === step;
  }

  resetFilters(): void {
    this.dateRange = 'last24h';
    this.statusFilter = 'all';
    this.searchQuery = '';
  }
}