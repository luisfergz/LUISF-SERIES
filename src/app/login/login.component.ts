import { C } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { SeriesService } from '../services/series.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  recuerdame = false;
  mostrarPassword = false;

  constructor(private authService: AuthService, private router: Router, private seriesService: SeriesService) {}
  
  ngOnInit(): void {
    const recordado = localStorage.getItem('loginRecordado');
    if (recordado) {
      const { email } = JSON.parse(recordado);
      this.email = email;
      this.recuerdame = true;
    }
  }

  alternarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  async iniciarSesion() {
    this.error = '';

    if (this.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }
    
    try {
      if (this.recuerdame) {
        localStorage.setItem(
          'loginRecordado',
          JSON.stringify({ email: this.email })
        );
      } else {
        localStorage.removeItem('loginRecordado');
      }
      await this.authService.signIn(this.email, this.password);
      await this.seriesService.verificarOCrearPerfil();
      this.router.navigate(['/']);
    } catch (e: any) {
      this.error = e.message;
    }
  }
}
