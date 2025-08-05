import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SeriesService } from '../services/series.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  avatar: string | null = null;
  dropdownCuenta = false;
  email = '';
  usuario: string | null = null;
  @ViewChild('menuWrapper') menuWrapper!: ElementRef;

  menuAbierto: boolean = false;
  cuentaAbierto: boolean = false;

  sesionIniciada: boolean = false;

  esAdmin = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private seriesService: SeriesService
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe(async user => {
      this.sesionIniciada = !!user;
      this.email = user?.email?.split('@')[0] ?? '';

      this.usuario = await this.seriesService.obtenerNombreUsuario();

      if (user) {
        try {
          this.esAdmin = await firstValueFrom(this.seriesService.esUsuarioAdmin());
        } catch (err) {
          console.error('Error al verificar admin:', err);
          this.esAdmin = false;
        }
      } else {
        this.esAdmin = false;
      }
      const url = await this.seriesService.obtenerAvatarUrl();
      this.avatar = url || 'general/user-default.jpg';
    });
  }

  alternarMenu() {
    this.menuAbierto = !this.menuAbierto;
    document.body.style.overflow = this.menuAbierto ? 'hidden' : '';
    if (this.cuentaAbierto) {
      this.alternarCuenta();
    }
  }

  alternarCuenta() {
    this.cuentaAbierto = !this.cuentaAbierto;
    document.body.style.overflow = this.cuentaAbierto ? 'hidden' : '';
    if (this.menuAbierto) {
      this.alternarMenu();
    }
  }

  alternarDropdownCuenta(event: MouseEvent) {
    event.stopPropagation(); // evita que se cierre al hacer clic en el botón
    this.dropdownCuenta = !this.dropdownCuenta;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.menuWrapper?.nativeElement.contains(event.target)) {
      this.dropdownCuenta = false;
    }
  }

  async cerrarSesion() {
    try {
      await this.authService.signOut();
      window.location.reload();
    } catch (err: any) {
      console.error('Error al cerrar sesión:', err.message);
    }
  }
}
