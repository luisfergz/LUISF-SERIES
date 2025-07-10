import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service'; // Ajusta la ruta según tu estructura
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

declare var bootstrap: any;

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class SignupComponent {
  signupForm: FormGroup;
  loading = false;
  errorMessage = '';
  modal: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public activeModal: NgbActiveModal
  ) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get email() {
    return this.signupForm.get('email');
  }

  get password() {
    return this.signupForm.get('password');
  }

  async onSubmit() {
    if (this.signupForm.invalid) return;

    this.loading = true;
    const { email, password } = this.signupForm.value;

    try {
      await this.authService.signUp(email, password);
      alert('Registro exitoso. Por favor, verifica tu email.');
    } catch (error) {
      if (error instanceof Error) {
        this.errorMessage = error.message;
      } else {
        this.errorMessage = 'Ocurrió un error desconocido.';
      }
    } finally {
      this.loading = false;
    }
  }

  closeModal() {
    this.activeModal.close();
  }
}
