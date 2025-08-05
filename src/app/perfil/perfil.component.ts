import { C } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SeriesService } from '../services/series.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  email = '';
  usuario: string | null = null;
  nuevo_usuario: string | null = null;
  avatar: string | null = null;
  mensaje = '';
  errorAvatar: string = '';
  errorUsuario: string = '';
  editandoUsuario: boolean = false;

  constructor(private authService: AuthService, private seriesService: SeriesService) {}

  async ngOnInit() {
    const user = this.authService.getUserSync();
    this.email = user?.email ?? '';
    
    const url = await this.seriesService.obtenerAvatarUrl();
    this.avatar = url || 'general/user-default.jpg';

    this.usuario = await this.seriesService.obtenerNombreUsuario();
    this.nuevo_usuario = this.usuario;
  }

  async guardarUsuario() {
    this.errorUsuario = '';
    if (!this.nuevo_usuario) {
      this.errorUsuario = 'Ingresa un nombre de usuario';
      return;
    }
    if (this.nuevo_usuario.length < 3) {
      this.errorUsuario = 'Al menos 3 caracteres';
      return;
    }
    if (this.nuevo_usuario.length > 20) {
      this.errorUsuario = 'Máximo 20 caracteres';
      return;
    }
    try {
      await this.seriesService.guardarNombreUsuario(this.nuevo_usuario);
      this.mensaje = 'Nombre de usuario actualizado correctamente';
      this.editandoUsuario = false;
      this.usuario = this.nuevo_usuario;
    } catch (e: any) {
      this.errorUsuario = e.message || 'Error al guardar el nombre de usuario';
    }
  }

  cancelarEdicion() {
    this.errorUsuario = '';
    this.editandoUsuario = false;
  }

  cambiarAvatar() {
    this.fileInput.nativeElement.click();
  }

  async seleccionarAvatar(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.mensaje = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.errorAvatar = 'Solo se permiten imágenes';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      this.errorAvatar = 'La imagen debe pesar menos de 2MB';
      return;
    }

    try {
      await this.seriesService.cambiarAvatar(file);
      this.mensaje = 'Avatar actualizado correctamente';
      
      const url = await this.seriesService.obtenerAvatarUrl();
      this.avatar = url || 'general/user-default.jpg';
    } catch (e: any) {
      this.errorAvatar = e.message || 'Error al cambiar el avatar';
    } finally {
      this.fileInput.nativeElement.value = '';
    }
  }
}
