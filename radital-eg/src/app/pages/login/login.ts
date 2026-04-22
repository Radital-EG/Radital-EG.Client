import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  @ViewChild('passwordInput') passwordInput!: ElementRef;

  employeeId: string = '';
  password: string = '';
  showPassword: boolean = false;
  idTouched: boolean = false;
  
  // Tracks previous valid state to prevent stealing focus repeatedly
  private wasIdValid: boolean = false;

  get isIdValid(): boolean {
    // Regex: Starts with RAD or TEC (case-insensitive), followed by exactly 7 digits
    const idPattern = /^(RAD|TEC)\d{7}$/i;
    return idPattern.test(this.employeeId);
  }

  get showIdError(): boolean {
    return this.idTouched && !this.isIdValid && this.employeeId.length > 0;
  }

  get isFormValid(): boolean {
    return this.isIdValid && this.password.length > 0;
  }

  onIdChange(value: string): void {
    this.idTouched = true;
    
    // Auto-uppercase the input to help the user
    this.employeeId = value.toUpperCase();

    const currentlyValid = this.isIdValid;
    
    // If the ID just transitioned from invalid to valid, focus the password input
    if (currentlyValid && !this.wasIdValid) {
      setTimeout(() => {
        this.passwordInput?.nativeElement?.focus();
      }, 50); // slight delay to allow angular to enable the disabled field first
    }
    
    this.wasIdValid = currentlyValid;
  }

  togglePassword(): void {
    if (this.isIdValid) {
      this.showPassword = !this.showPassword;
    }
  }

  onSignIn(): void {
    if (this.isFormValid) {
      console.log('Sign in with:', this.employeeId);
      // TODO: connect to auth service
    }
  }

  onRequestAccess(): void {
    console.log('Request system access');
    // TODO: navigate to request access page
  }

  onForgotPassword(): void {
    console.log('Forgot password');
    // TODO: navigate to forgot password page
  }
}