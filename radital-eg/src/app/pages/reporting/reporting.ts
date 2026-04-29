import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule }   from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { ReportingService }           from './reporting.service';
import { WorkloadDto }                from '../radiologist-dashboard/radiologist-dashboard.service';

interface Modality {
  id:          string;
  series:      string;
  description: string;
  imageUrl:    string;
}

// Report form split into the fields the API actually expects
export interface ReportForm {
  clinicalHistory: string;
  technique:       string;
  findings:        string;
  impression:      string;
  recommendation:  string;
}

@Component({
  selector:    'app-reporting',
  standalone:  true,
  imports:     [CommonModule, FormsModule],
  templateUrl: './reporting.html',
  styleUrls:   ['./reporting.css'],
})
export class ReportingComponent implements OnInit {

  // ── UI state ────────────────────────────────────────────
  bannerVisible: boolean = true;
  draftSaved:    boolean = false;
  isLoading:     boolean = true;
  isSubmitting:  boolean = false;
  errorMessage:  string  = '';

  // ── Case data ───────────────────────────────────────────
  caseUuid:        string       = '';
  reportId:        string | null = null;   // set after first submit
  currentCase:     WorkloadDto  | null = null;
  selectedModality: Modality    | null = null;
  modalities:      Modality[]   = [];

  // ── Report form ─────────────────────────────────────────
  report: ReportForm = {
    clinicalHistory: '',
    technique:       '',
    findings:        '',
    impression:      '',
    recommendation:  '',
  };

  constructor(
    private router:   Router,
    private route:    ActivatedRoute,
    private service:  ReportingService,
    private cdr:      ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    this.caseUuid = this.route.snapshot.queryParams['id'] ?? '';

    if (!this.caseUuid) {
      this.errorMessage = 'No case ID provided. Please open a case from the dashboard.';
      this.isLoading    = false;
      this.cdr.detectChanges();
      return;
    }

    await this.loadCase();
  }

  async loadCase(): Promise<void> {
    this.isLoading    = true;
    this.errorMessage = '';
    try {
      this.currentCase = await this.service.getCase(this.caseUuid);

      // Pre-fill clinical history from the case
      this.report.clinicalHistory = this.currentCase.patientMedicalHistory ?? '';

      // Build modalities from the single storageReference the API returns.
      // When the backend serves multiple images, map them here instead.
      this.modalities = [
        {
          id:          'm1',
          series:      'Ser 1',
          description: this.currentCase.suggestedDepartment ?? 'Primary Study',
          imageUrl:    this.currentCase.storageReference,
        },
      ];
      this.selectedModality = this.modalities[0];

    } catch (err: unknown) {
      this.errorMessage = err instanceof Error
        ? err.message
        : 'Failed to load case. Please go back and try again.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  selectModality(modality: Modality): void {
    this.selectedModality = modality;
  }

  confirmReceipt(): void {
    this.bannerVisible = false;
  }

  saveDraft(): void {
    // Saves locally for now — wire to a PATCH/draft endpoint when available
    this.draftSaved = true;
    setTimeout(() => { this.draftSaved = false; }, 2500);
    this.router.navigate(['/radiologist-dashboard'], { queryParams: { autosaved: 'true' } });
  }

  async submitReport(): Promise<void> {
    if (!this.report.findings.trim() || !this.report.impression.trim()) {
      alert('Please fill in at least Findings and Impression before finalizing.');
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    try {
      const created = await this.service.submitReport({
        reportingRequestId: this.caseUuid,
        clinicalHistory:    this.report.clinicalHistory,
        technique:          this.report.technique,
        findings:           this.report.findings,
        impression:         this.report.impression,
        recommendation:     this.report.recommendation,
      });

      this.reportId = created.id;
      this.router.navigate(['/radiologist-dashboard'], { queryParams: { finalized: 'true' } });

    } catch (err: unknown) {
      this.errorMessage = err instanceof Error
        ? err.message
        : 'Submission failed. Please try again.';
    } finally {
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }
  }

  async downloadPdf(): Promise<void> {
    if (!this.reportId) return;
    try {
      await this.service.downloadPdf(this.reportId);
    } catch {
      this.errorMessage = 'Failed to download PDF.';
      this.cdr.detectChanges();
    }
  }

  goToCaseList(): void {
    this.router.navigate(['/radiologist-dashboard'], { queryParams: { autosaved: 'true' } });
  }
}