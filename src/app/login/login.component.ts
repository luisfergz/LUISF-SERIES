import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  email: string = '';
  password: string = '';

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    console.log('Correo:', this.email);
    console.log('Contraseña:', this.password);
    this.activeModal.close({ email: this.email, password: this.password });
  }

  closeModal() {
    this.activeModal.dismiss();
  }
}
