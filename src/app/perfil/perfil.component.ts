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
  usuario = '';
  avatar: string | null = null;
  mensaje = '';
  error: string = '';

  constructor(private authService: AuthService, private seriesService: SeriesService) {}

  async ngOnInit() {
    const user = this.authService.getUserSync();
    this.email = user?.email ?? '';
    
    const url = await this.seriesService.obtenerAvatarUrl();
    this.avatar = url || 'general/user-default.jpg';
  }

  cambiarAvatar() {
    this.fileInput.nativeElement.click(); // abre el selector de archivos
  }

  async seleccionarAvatar(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.mensaje = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.error = 'Solo se permiten imágenes';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      this.error = 'La imagen debe pesar menos de 2MB';
      return;
    }

    try {
      await this.seriesService.cambiarAvatar(file);
      this.mensaje = 'Avatar actualizado correctamente';
    } catch (e: any) {
      this.error = e.message || 'Error al cambiar el avatar';
    } finally {
      this.fileInput.nativeElement.value = '';
    }
  }
}
