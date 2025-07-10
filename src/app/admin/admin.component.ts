import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
})
export class AdminComponent {
  email = '';
  password = '';
  error = '';
  mostrarPassword = false;
  accesoPermitido = false;

  constructor(private authService: AuthService, private router: Router) { }

  async ngOnInit() {
    try {
      const user = await this.authService.getUser();
      this.accesoPermitido = !!user;
    } catch (err) {
      this.accesoPermitido = false;
    }
  }

  async iniciarSesion() {
    try {
      await this.authService.signIn(this.email, this.password);
      this.accesoPermitido = true;
      this.error = '';
    } catch (err: any) {
      this.error = err.message || 'Error al iniciar sesión';
      this.accesoPermitido = false;
    }
  }

  async cerrarSesion() {
    try {
      await this.authService.signOut();
      this.accesoPermitido = false;
      this.email = '';
      this.password = '';
    } catch (err: any) {
      console.error('Error al cerrar sesión:', err.message);
    }
  }

  alternarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  agregarSerie() {
    this.router.navigate(['/agregar-serie']);
  }

}
