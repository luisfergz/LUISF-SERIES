import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { InformacionTecnica, Serie, Temporada } from '../models/serie.model';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SeriesService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  // Método para obtener la instancia del cliente
  get client(): SupabaseClient {
    return this.supabase;
  }

  getSeries(): Observable<Serie[]> {
    return from(
      this.supabase
        .from('serie')
        .select(`*, temporada(*), informacion_tecnica(*)`) // Relacionar tablas directamente
        .then(({ data, error }) => {
          if (error) {
            throw new Error('Error obteniendo series: ' + error.message);
          }
          return data as Serie[];
        })
    ).pipe(
      catchError((error) => {
        throw error;
      })
    );
  }

  getSeriesById(id: string): Observable<Serie | undefined> {
    return from(
      this.supabase
        .from('serie')
        .select(`*, temporada(*), informacion_tecnica(*)`) // Relacionar tablas directamente
        .eq('id', id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            throw new Error('Error obteniendo la serie: ' + error.message);
          }
          return data as Serie;
        })
    ).pipe(
      catchError((error) => {
        throw error;
      })
    );
  }

  getSeriesForCarousel(): Observable<Serie[]> {
    return from(
      this.supabase
        .from('serie')
        .select(`*, temporada(*), informacion_tecnica(*)`) // Relacionar temporadas e información técnica directamente
        .gt('pos', 0) // Filtrar por series con posición mayor a 0
        .then(({ data, error }) => {
          if (error || !data) {
            throw new Error('Error obteniendo series para el carrusel: ' + error?.message);
          }
          return data as Serie[];
        })
    ).pipe(
      catchError((error) => {
        throw error;
      })
    );
  }

}
