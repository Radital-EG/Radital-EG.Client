import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

export interface CaseCard {
  id: number;
  caseNumber: string;
  patientId: string;
  modality: 'MRI' | 'CT Scan' | 'X-Ray';
  submissionTime: string;
  isStat: boolean;
  action: 'OPEN CRITICAL STUDY' | 'REVIEW SERIES';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent {
  activeTab: 'caselist' | 'worklist' = 'caselist';
  viewMode: 'grid' | 'list' = 'list';
  searchQuery: string = '';
  showNotification: boolean = true;
  toastMessage: string = '';
  toastType: 'autosave' | 'success' | '' = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      let message = '';
      let type: 'autosave' | 'success' | '' = '';

      if (params['autosaved'] === 'true') {
        message = 'Report autosaved';
        type = 'autosave';
      } else if (params['finalized'] === 'true') {
        message = 'Report finalized & submitted';
        type = 'success';
      }

      if (message) {
        this.toastMessage = message;
        this.toastType = type;
        // Clear the query param from the URL without triggering navigation
        this.router.navigate([], { queryParams: {}, replaceUrl: true });
        // Auto-dismiss after 3.5 seconds
        setTimeout(() => { this.toastMessage = ''; this.toastType = ''; }, 3500);
      }
    });
  }

  // Sidebar filters
  filters = {
    modality: { MRI: true, CTScans: true, XRay: true },
    priority: { Urgent: true, Standard: true }
  };

  allCases: CaseCard[] = [
    { id: 1, caseNumber: 'Case #8829', patientId: 'PATIENT ID: #1029', modality: 'MRI', submissionTime: '10m ago', isStat: true, action: 'OPEN CRITICAL STUDY' },
    { id: 2, caseNumber: 'Case #8830', patientId: 'PATIENT ID: #1030', modality: 'X-Ray', submissionTime: '24m ago', isStat: false, action: 'REVIEW SERIES' },
    { id: 3, caseNumber: 'Case #8831', patientId: 'PATIENT ID: #1031', modality: 'CT Scan', submissionTime: '45m ago', isStat: false, action: 'REVIEW SERIES' },
    { id: 4, caseNumber: 'Case #8832', patientId: 'PATIENT ID: #1032', modality: 'MRI', submissionTime: '1h ago', isStat: false, action: 'REVIEW SERIES' },
    { id: 5, caseNumber: 'Case #8833', patientId: 'PATIENT ID: #1033', modality: 'CT Scan', submissionTime: '1h ago', isStat: true, action: 'OPEN CRITICAL STUDY' },
  ];

  get statCount(): number {
    return this.allCases.filter(c => c.isStat).length;
  }

  get filteredCases(): CaseCard[] {
    return this.allCases
      .filter(c => {
        const modalityMatch =
          (c.modality === 'MRI' && this.filters.modality.MRI) ||
          (c.modality === 'CT Scan' && this.filters.modality.CTScans) ||
          (c.modality === 'X-Ray' && this.filters.modality.XRay);

        // A case passes the priority filter if at least one matching checkbox is ticked
        const priorityMatch =
          (c.isStat && this.filters.priority.Urgent) ||
          (!c.isStat && this.filters.priority.Standard);

        const searchMatch = this.searchQuery
          ? c.caseNumber.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          c.patientId.toLowerCase().includes(this.searchQuery.toLowerCase())
          : true;

        return modalityMatch && priorityMatch && searchMatch;
      })
      // Critical / STAT cases always float to the top
      .sort((a, b) => (b.isStat ? 1 : 0) - (a.isStat ? 1 : 0));
  }

  getModalityIcon(modality: string): string {
    switch (modality) {
      case 'MRI': return 'M';
      case 'CT Scan': return 'CT';
      case 'X-Ray': return 'X';
      default: return '?';
    }
  }

  acknowledgeNotification(): void {
    this.showNotification = false;
  }

  openCase(c: CaseCard): void {
    console.log('Opening case:', c.caseNumber);
  }

  goToWorklist(): void {
    this.router.navigate(['/reporting']);
  }
}