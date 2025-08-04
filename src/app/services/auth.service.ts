import { Injectable } from '@angular/core';
import { SeriesService } from './series.service';
import { BehaviorSubject } from 'rxjs';
import { User } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private supabaseService: SeriesService) {
    // Escuchar cambios de sesión
    this.supabaseService.client.auth.onAuthStateChange((_event, session) => {
      this.userSubject.next(session?.user ?? null);
    });

    // Cargar el usuario al iniciar
    this.cargarUsuarioInicial();
  }

  private async cargarUsuarioInicial() {
    try {
      const { data, error } = await this.supabaseService.client.auth.getUser();
      if (error) {
        this.userSubject.next(null);
      } else {
        this.userSubject.next(data.user ?? null);
      }
    } catch (e) {
      this.userSubject.next(null);
    }
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabaseService.client.auth.signInWithPassword({ email, password });
    if (error) throw new Error(this.traducirError(error.message));
    this.userSubject.next(data.user ?? null); // actualizar estado
    return data;
  }

  async signUp(email: string, password: string) {
    const { error } = await this.supabaseService.client.auth.signUp({ email, password });
    if (error) throw new Error(this.traducirError(error.message));
  }

  async signOut() {
    const { error } = await this.supabaseService.client.auth.signOut();
    if (error) throw new Error(this.traducirError(error.message));
    this.userSubject.next(null); // actualizar estado
  }

  async getUser(): Promise<User | null> {
    try {
      const { data, error } = await this.supabaseService.client.auth.getUser();
      if (error) return null;
      return data.user;
    } catch {
      return null;
    }
  }

  getUserSync(): User | null {
    return this.userSubject.value;
  }

  private traducirError(error: string): string {
    switch (error) {
      case 'Invalid login credentials':
        return 'Correo o contraseña incorrectos';
      case 'User already registered':
        return 'Este correo ya está registrado';
      case 'Email not confirmed':
        return 'Debes confirmar tu correo antes de iniciar sesión';
      case 'Email not found':
        return 'No se encontró una cuenta con este correo';
      default:
        return 'Ocurrió un error inesperado';
    }
  }
}
