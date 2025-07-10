import { Injectable } from '@angular/core';
import { SeriesService } from './series.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private supabaseService: SeriesService) { }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabaseService.client.auth.signInWithPassword({ email, password });
    if (error) throw new Error(this.traducirError(error.message));
    return data;
  }

  async signUp(email: string, password: string) {
    const { error } = await this.supabaseService.client.auth.signUp({ email, password });
    if (error) throw new Error(this.traducirError(error.message));
  }

  async signOut() {
    const { error } = await this.supabaseService.client.auth.signOut();
    if (error) throw new Error(this.traducirError(error.message));
  }

  async getUser() {
    const { data, error } = await this.supabaseService.client.auth.getUser();
    if (error) throw new Error(this.traducirError(error.message));
    return data.user;
  }

  private traducirError(error: string): string {
    switch (error) {
      case 'Invalid login credentials':
        return 'Correo o contraseña incorrectos';
      case 'User already registered':
        return 'Este correo ya está registrado';
      case 'Email not confirmed':
        return 'Debes confirmar tu correo antes de iniciar sesión';
      case 'Password should be at least 6 characters':
        return 'La contraseña debe tener al menos 6 caracteres';
      case 'Email not found':
        return 'No se encontró una cuenta con este correo';
      default:
        return 'Ocurrió un error inesperado';
    }
  }

}

