import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-recuperar-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './recuperar-password.component.html',
  styleUrl: './recuperar-password.component.css'
})
export class RecuperarPasswordComponent {
  email = '';
  mensaje = '';
  error = '';

  constructor(private authService: AuthService, private router: Router) { }

  async recuperarContrasena() {
    this.mensaje = '';
    this.error = '';
    try {
      await this.authService.enviarCorreoRecuperacion(this.email);
      this.mensaje = 'Se ha enviado un enlace de recuperación a tu correo.';
    } catch (e: any) {
      this.error = e.message || 'Error al enviar el enlace de recuperación.';
    }
  }
}
