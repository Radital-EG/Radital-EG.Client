import { Component } from '@angular/core';
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
  employeeId: string = '';
  password: string = '';
  showPassword: boolean = false;

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSignIn(): void {
    console.log('Sign in with:', this.employeeId);
    // TODO: connect to auth service
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