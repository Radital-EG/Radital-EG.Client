// ─────────────────────────────────────────────────────────────────────────────
// imaging-request.component.ts  –  Updated component wired to ImagingRequestService
// ─────────────────────────────────────────────────────────────────────────────
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';

import { ImagingRequestService, ImagingRequestFormModel } from './imaging-request.service';
import { ReportingRequestResponseDto } from '../../models'; 

@Component({
  selector:    'app-imaging-request',
  standalone:  true,
  imports:     [CommonModule, FormsModule],
  templateUrl: './imaging-request.component.html',
  styleUrls:   ['./imaging-request.component.css'],
})
export class ImagingRequestComponent {

  // ── Form model ────────────────────────────────────────────────────────
  // All fields the HTML template binds to via [(ngModel)].
  // The extra fields (beyond the original model) feed the API DTO.
  model: ImagingRequestFormModel = {
    patientName:            '',
    age:                    null,   
   patientId:              '',     
   notes:                  '', 
    gender:                 '',
    patientDateOfBirth:     '',
    patientPhoneNumber:     '',
    patientAddress:         '',
    patientMedicalHistory:  '',
    patientNotes:           '',
    scanType:               'CT',
    imageUrl:               '',
    suggestedDepartment:    '',
    priority:               'Routine',
    dueDate:                '',
    assignedRadiologistId:  '',
    isEmergency:            false,
    emergencyJustification: '',
  };

  // ── UI state ──────────────────────────────────────────────────────────
  isLoading:       boolean = false;
  errorMessage:    string  = '';
  successMessage:  string  = '';
  lastCreated:     ReportingRequestResponseDto | null = null;

  constructor(private imagingRequestService: ImagingRequestService) {}

  // ── Submit ────────────────────────────────────────────────────────────

  async submitRequest(): Promise<void> {
    this.isLoading      = true;
    this.errorMessage   = '';
    this.successMessage = '';

    try {
      this.lastCreated    = await this.imagingRequestService.submit(this.model);
      this.successMessage = `Request submitted successfully. ID: ${this.lastCreated.id}`;
      this.reset();
    } catch (err: unknown) {
      this.errorMessage = err instanceof Error
        ? err.message
        : 'Submission failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  // ── Delete (local clear — no DELETE endpoint in swagger) ───────────────

  deleteRequest(): void {
    if (!confirm('Are you sure you want to discard this request?')) return;
    this.reset();
    this.successMessage = '';
    this.errorMessage   = '';
    this.lastCreated    = null;
  }

  // ── Reset form ────────────────────────────────────────────────────────

  reset(): void {
    this.model = {
      patientName:            '',
      age:                    null,   
      patientId:              '',     
      notes:                  '',     
      gender:                 '',
      patientDateOfBirth:     '',
      patientPhoneNumber:     '',
      patientAddress:         '',
      patientMedicalHistory:  '',
      patientNotes:           '',
      scanType:               'CT',
      imageUrl:               '',
      suggestedDepartment:    '',
      priority:               'Routine',
      dueDate:                '',
      assignedRadiologistId:  '',
      isEmergency:            false,
      emergencyJustification: '',
    };
  }

  // ── Load image preview ────────────────────────────────────────────────

  loadImage(): void {
    // The template already uses *ngIf="model.imageUrl" to show the <img>.
    // This method is kept so the button still works — no extra logic needed.
    if (!this.model.imageUrl) {
      this.errorMessage = 'Please enter an image URL first.';
    }
  }
}