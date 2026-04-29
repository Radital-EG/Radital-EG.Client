import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule }   from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RadiologistDashboardService } from './radiologist-dashboard.service';

export interface CaseCard {
  id:             number;
  uuid:           string;
  caseNumber:     string;
  patientId:      string;
  patientName:    string;
  modality:       'MRI' | 'CT Scan' | 'X-Ray';
  submissionTime: string;
  isStat:         boolean;
  action:         'OPEN CRITICAL STUDY' | 'REVIEW SERIES';

  // Extended from API
  priority:               number;
  isEmergency:            boolean;
  emergencyJustification: string;
  status:                 number;
  statusLabel:            string;
  dueDate:                string;
  storageReference:       string;
  suggestedDepartment:    string;
  reportId:               string;
}

@Component({
  selector:    'app-dashboard',
  standalone:  true,
  imports:     [CommonModule, FormsModule],
  templateUrl: './radiologist-dashboard.html',
  styleUrls:   ['./radiologist-dashboard.css'],
})
export class RadiologistDashboardComponent implements OnInit {
  activeTab:        'caselist' | 'worklist' = 'caselist';
  viewMode:         'grid' | 'list'         = 'list';
  searchQuery:      string  = '';
  showNotification: boolean = false;
  toastMessage:     string  = '';
  toastType:        'autosave' | 'success' | '' = '';

  isLoading:    boolean = true;
  errorMessage: string  = '';

  allCases: CaseCard[] = [];

  filters = {
    modality: { MRI: true, CTScans: true, XRay: true },
    priority: { Urgent: true, Standard: true },
  };

  constructor(
    private route:     ActivatedRoute,
    private router:    Router,
    private service:   RadiologistDashboardService,
    private cdr:       ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    // Handle toast query params
    this.route.queryParams.subscribe(params => {
      let message = '';
      let type: 'autosave' | 'success' | '' = '';
      if (params['autosaved'] === 'true')  { message = 'Report autosaved';              type = 'autosave'; }
      if (params['finalized'] === 'true')  { message = 'Report finalized & submitted';  type = 'success';  }
      if (message) {
        this.toastMessage = message;
        this.toastType    = type;
        this.router.navigate([], { queryParams: {}, replaceUrl: true });
        setTimeout(() => { this.toastMessage = ''; this.toastType = ''; }, 3500);
      }
    });

    await this.loadData();
  }

  async loadData(): Promise<void> {
    this.isLoading    = true;
    this.errorMessage = '';
    try {
      this.allCases = await this.service.loadWorkload();
    } catch (err: unknown) {
      this.errorMessage = err instanceof Error
        ? err.message
        : 'Failed to load workload. Please refresh.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  get statCount(): number {
    return this.allCases.filter(c => c.isStat).length;
  }

  get filteredCases(): CaseCard[] {
    return this.allCases
      .filter(c => {
        const modalityMatch =
          (c.modality === 'MRI'     && this.filters.modality.MRI)     ||
          (c.modality === 'CT Scan' && this.filters.modality.CTScans) ||
          (c.modality === 'X-Ray'   && this.filters.modality.XRay);
        const priorityMatch =
          (c.isStat  && this.filters.priority.Urgent)   ||
          (!c.isStat && this.filters.priority.Standard);
        const searchMatch = this.searchQuery
          ? c.caseNumber.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            c.patientId.toLowerCase().includes(this.searchQuery.toLowerCase())
          : true;
        return modalityMatch && priorityMatch && searchMatch;
      })
      .sort((a, b) => (b.isStat ? 1 : 0) - (a.isStat ? 1 : 0));
  }

  getModalityIcon(modality: string): string {
    switch (modality) {
      case 'MRI':     return 'M';
      case 'CT Scan': return 'CT';
      case 'X-Ray':   return 'X';
      default:        return '?';
    }
  }

  acknowledgeNotification(): void { this.showNotification = false; }

  openCase(c: CaseCard): void {
    this.router.navigate(['/reporting'], { queryParams: { id: c.uuid } });
  }

  goToWorklist(): void {
    this.router.navigate(['/reporting']);
  }
}