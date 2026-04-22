import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-imaging-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './imaging-request.component.html',
  styleUrls: ['./imaging-request.component.css']
})
export class ImagingRequestComponent {

  model = {
    patientName: '',
    age: null,
    gender: '',
    patientId: '',
    scanType: '',
    notes: '',
    imageUrl: ''
  };

  submitRequest() {
    console.log(this.model);
    alert('Request submitted successfully ✅');
  }

  reset() {
    this.model = {
      patientName: '',
      age: null,
      gender: '',
      patientId: '',
      scanType: '',
      notes: '',
      imageUrl: ''
    };
  }

  loadImage() {
    if (!this.model.imageUrl) return;
    console.log("Loaded image:", this.model.imageUrl);
  }
}