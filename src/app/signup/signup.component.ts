import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { C } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  usuario = '';
  email = '';
  password = '';
  confirm_password = '';
  error = '';
  mostrarPassword = false;
  mensaje = '';

  constructor(private authService: AuthService, private router: Router) { }

  alternarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  async crearCuenta() {
    this.error = '';
    this.mensaje = '';

    if (this.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    if (this.password !== this.confirm_password) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    try {
      await this.authService.signUp(this.email, this.password);
      this.mensaje = 'Cuenta creada correctamente. Revisa tu correo para confirmar.';
    } catch (e: any) {
      this.error = e.message;
    }
  }

}
