import { Injectable } from '@angular/core';
import { SeriesService } from './series.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private supabaseService: SeriesService) {}

  async signUp(email: string, password: string) {
    const { error } = await this.supabaseService.client.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabaseService.client.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.supabaseService.client.auth.signOut();
    if (error) throw error;
  }

  async getUser() {
    const { data, error } = await this.supabaseService.client.auth.getUser();
    if (error) throw error;
    return data.user;
  }
}
