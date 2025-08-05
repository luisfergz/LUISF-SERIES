import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-actualizar-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './actualizar-password.component.html',
  styleUrl: './actualizar-password.component.css'
})
export class ActualizarPasswordComponent {
  mensaje = '';
  error = '';
  mostrarPassword = false;
  contrasena = '';
  confirmar_contrasena = '';

  constructor(private authService: AuthService, private router: Router) { }

  alternarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  async actualizarContrasena() {
    this.error = '';
    this.mensaje = '';

    if (this.contrasena.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    if (this.contrasena !== this.confirmar_contrasena) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    try {
      await this.authService.cambiarContrasena(this.contrasena);
      this.mensaje = 'Contraseña actualizada correctamente. Cerrando sesión...';
      setTimeout(() => this.authService.signOut(), 3000);
      setTimeout(() => this.router.navigate(['/login']), 3000);
    } catch (e: any) {
      this.error = e.message;
    }
  }
}
