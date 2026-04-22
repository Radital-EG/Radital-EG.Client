import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Define the structure of a patient case
interface PatientCase {
  id: string;
  label: string;
  history: string;
  imageUrl: string;
}

@Component({
  selector: 'app-reporting',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reporting.html',
  styleUrls: ['./reporting.css']
})
export class ReportingComponent {
  // State for the urgent banner
  bannerVisible: boolean = true;
  
  // State for the currently viewed case
  selectedCase: PatientCase | null = null;
  reportText: string = '';

  // Dummy data to generate the multiple boxes
  cases: PatientCase[] = [
    {
      id: '8824-A',
      label: 'CHEST CT W/O CONTRAST',
      history: '64-year-old male with chronic COPD and worsening shortness of breath over the last 48 hours. History of heavy tobacco use (40 pack-years). Previous imaging from 2022 shows mild emphysematous changes.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Normal_axial_high-resolution_CT_of_the_lungs.jpg/600px-Normal_axial_high-resolution_CT_of_the_lungs.jpg'
    },
    {
      id: '8825-B',
      label: 'BRAIN MRI T1',
      history: '45-year-old female presenting with severe frequent migraines and occasional dizziness. No previous history of neurological disorders.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Normal_axial_T2-weighted_MR_image_of_the_brain.jpg/600px-Normal_axial_T2-weighted_MR_image_of_the_brain.jpg'
    },
    {
      id: '8829-STAT',
      label: 'STAT ABDOMINAL MRI',
      history: 'URGENT: 50-year-old male experiencing acute severe right upper quadrant pain. Suspected cholelithiasis or acute appendicitis.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Gallstone_on_ultrasound.jpg/600px-Gallstone_on_ultrasound.jpg'
    }
  ];

  // Dismiss the red banner
  confirmReceipt() {
    this.bannerVisible = false;
  }

  // Handle clicking a case box
  viewCase(patientCase: PatientCase) {
    this.selectedCase = patientCase;
    this.reportText = ''; // Clear report text for the new case
  }

  // Go back to the list of cases
  backToList() {
    this.selectedCase = null;
  }

  // Handle report submission
  submitReport() {
    if (!this.reportText.trim()) {
      alert('Please write a report before finalizing.');
      return;
    }
    alert(`Report for Case #${this.selectedCase?.id} finalized and submitted!`);
    this.backToList();
  }
}