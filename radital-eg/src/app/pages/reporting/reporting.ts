import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Define the structure for an individual scan/modality
interface Modality {
  id: string;
  series: string;
  description: string;
  imageUrl: string;
}

// Define the structure for the single patient case
interface PatientCase {
  caseId: string;
  patientName: string;
  history: string;
  modalities: Modality[];
}

@Component({
  selector: 'app-reporting',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reporting.html',
  styleUrls: ['./reporting.css']
})
export class ReportingComponent implements OnInit {
  bannerVisible: boolean = true;
  reportText: string = '';

  // The single case assigned to the radiologist
  currentCase!: PatientCase;
  
  // The currently viewed scan
  selectedModality: Modality | null = null;

  ngOnInit() {
    // Initialize the single case with multiple modalities
    this.currentCase = {
      caseId: '8824-A',
      patientName: 'ROE, JONATHAN',
      history: '64-year-old male with chronic COPD and worsening shortness of breath over the last 48 hours. History of heavy tobacco use (40 pack-years). Previous imaging from 2022 shows mild emphysematous changes.',
      modalities: [
        {
          id: 'm1',
          series: 'Ser 1',
          description: 'CHEST CT W/O CONTRAST - AXIAL',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Normal_axial_high-resolution_CT_of_the_lungs.jpg/600px-Normal_axial_high-resolution_CT_of_the_lungs.jpg'
        },
        {
          id: 'm2',
          series: 'Ser 2',
          description: 'CHEST X-RAY PA',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Normal_posteroanterior_%28PA%29_chest_radiograph_%28X-ray%29.jpg/600px-Normal_posteroanterior_%28PA%29_chest_radiograph_%28X-ray%29.jpg'
        },
        {
          id: 'm3',
          series: 'Ser 3',
          description: 'CHEST CT - CORONAL',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Computed_tomography_of_human_lungs_-_coronal_plane.png/600px-Computed_tomography_of_human_lungs_-_coronal_plane.png'
        }
      ]
    };

    // Default to the first modality
    this.selectedModality = this.currentCase.modalities[0];
  }

  confirmReceipt() {
    this.bannerVisible = false;
  }

  // Handle clicking a different modality box
  selectModality(modality: Modality) {
    this.selectedModality = modality;
  }

  submitReport() {
    if (!this.reportText.trim()) {
      alert('Please write a report before finalizing.');
      return;
    }
    alert(`Report for Case #${this.currentCase.caseId} finalized and submitted!`);
  }
}