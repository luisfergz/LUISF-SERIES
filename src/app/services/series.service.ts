import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Carrusel, InformacionTecnica, Serie, Temporada } from '../models/serie.model';
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

  obtenerSeries(): Observable<Serie[]> {
    return from(
      this.supabase
        .from('serie')
        .select('*')
        .eq('activo', true)
        .then(({ data, error }) => {
          if (error) throw new Error('Error obteniendo series: ' + error.message);
          return data as Serie[];
        })
    ).pipe(
      catchError((error) => {
        throw error;
      })
    );
  }
  obtenerSeriesCompletas(): Observable<Serie[]> {
    return from(
      this.supabase
        .from('serie')
        .select('*')
        .then(({ data, error }) => {
          if (error) throw new Error('Error obteniendo series: ' + error.message);
          return data as Serie[];
        })
    ).pipe(
      catchError((error) => {
        throw error;
      })
    );
  }

  obtenerSeriePorId(id: number): Observable<Serie | undefined> {
    return from(
      this.supabase
        .from('serie')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data, error }) => {
          if (error) throw new Error('Error obteniendo la serie: ' + error.message);
          return data as Serie;
        })
    ).pipe(
      catchError((error) => {
        throw error;
      })
    );
  }

  obtenerSeriePorSlug(slug: string): Observable<Serie | undefined> {
    return from(
      this.supabase
        .from('serie')
        .select('*')
        .eq('slug', slug)
        .eq('activo', true)
        .single()
        .then(({ data, error }) => {
          if (error) throw new Error('Error obteniendo serie por slug: ' + error.message);
          return data as Serie;
        })
    ).pipe(
      catchError((error) => {
        throw error;
      })
    );
  }

  esUsuarioAdmin(): Observable<boolean> {
    return from(this.supabase.auth.getUser()).pipe(
      switchMap(({ data, error }) => {
        if (error || !data?.user) return of(false);
        const userId = data.user.id;

        return from(
          this.supabase
            .from('perfiles')
            .select('id')
            .eq('id', userId)
            .eq('rol', 'admin')
            .limit(1)
            .maybeSingle()
        ).pipe(
          map(({ data }) => !!data),
          catchError(err => {
            console.error('Error al verificar admin:', err);
            return of(false);
          })
        );
      }),
      catchError(err => {
        console.error('Error al obtener usuario:', err);
        return of(false);
      })
    );
  }

  async obtenerAvatarUrl(): Promise<string | null> {
    const { data: userData, error: userError } = await this.supabase.auth.getUser();
    if (userError || !userData?.user) return null;

    const userId = userData.user.id;

    const { data: archivos, error: listError } = await this.supabase
      .storage
      .from('avatars')
      .list(userId);

    if (listError || !archivos || archivos.length === 0) return null;

    // Buscar el archivo llamado avatar con cualquier extensión
    const archivo = archivos.find(f => /^avatar\.[a-zA-Z0-9]+$/.test(f.name));
    if (!archivo) return null;

    const fullPath = `${userId}/${archivo.name}`;

    // Obtener la URL pública
    const { data } = this.supabase.storage
      .from('avatars')
      .getPublicUrl(fullPath);

    // Agrega timestamp para evitar caché
    return data?.publicUrl ? `${data.publicUrl}?t=${Date.now()}` : null;
  }

  async cambiarAvatar(file: File): Promise<void> {
    const { data: userData, error: userError } = await this.supabase.auth.getUser();
    if (userError || !userData?.user) throw new Error('No hay sesión activa');

    const userId = userData.user.id;
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension) throw new Error('Formato de archivo no válido');

    const filePath = `${userId}/avatar.${extension}`;

    // Eliminar todos los archivos previos en la carpeta del usuario
    const { data: archivos, error: listError } = await this.supabase
      .storage
      .from('avatars')
      .list(userId);

    if (listError) throw new Error('Error al listar archivos existentes');

    if (archivos && archivos.length > 0) {
      const archivosAEliminar = archivos.map(a => `${userId}/${a.name}`);
      const { error: deleteError } = await this.supabase
        .storage
        .from('avatars')
        .remove(archivosAEliminar);

      if (deleteError) throw new Error('Error al eliminar archivos antiguos');
    }

    // Subir el nuevo avatar
    const { error: uploadError } = await this.supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) throw new Error('Error al subir el avatar');
  }


  insertarSerie(serie: Omit<Serie, 'id'>): Observable<any> {
    return this.esUsuarioAdmin().pipe(
      switchMap((esAdmin) => {
        if (!esAdmin) {
          return throwError(() => new Error('Acceso denegado: solo los administradores pueden insertar series'));
        }
        return from(
          this.supabase
            .from('serie')
            .insert(serie)
            .select()
            .single()
        );
      })
    );
  }

  // Actualizar una serie
  actualizarSeriePorId(id: number, cambios: Partial<Serie>) {
    return this.esUsuarioAdmin().pipe(
      switchMap((esAdmin) => {
        if (!esAdmin) {
          return throwError(() => new Error('Acceso denegado: solo los administradores pueden actualizar series'));
        }
        return from(
          this.supabase
            .from('serie')
            .update(cambios)
            .eq('id', id)
            .select()
            .single()
        );
      })
    );
  }

  actualizarSeriePorSlug(slug: string, cambios: Partial<Serie>) {
    return this.esUsuarioAdmin().pipe(
      switchMap((esAdmin) => {
        if (!esAdmin) {
          return throwError(() => new Error('Acceso denegado: solo los administradores pueden actualizar series'));
        }
        return from(
          this.supabase
            .from('serie')
            .update(cambios)
            .eq('slug', slug)
            .select()
            .single()
        );
      })
    );
  }

  // Eliminar una serie
  eliminarSerie(id: number) {
    return this.esUsuarioAdmin().pipe(
      switchMap((esAdmin) => {
        if (!esAdmin) {
          return throwError(() => new Error('Acceso denegado: solo los administradores pueden actualizar series'));
        }
        return from(
          this.supabase
            .from('serie')
            .delete()
            .eq('id', id)
        );
      })
    );
  }

  obtenerSeriesParaCarrusel(): Observable<Serie[]> {
    return from(
      this.supabase
        .from('carrusel')
        .select('serie_id')
        .order('posicion', { ascending: true })
        .then(async ({ data: carruselData, error }) => {
          if (error) throw new Error('Error obteniendo carrusel: ' + error.message);
          if (!carruselData?.length) return [];

          const serieIds = carruselData.map((c: any) => c.serie_id);

          // Ahora buscar series activas con esos IDs, en orden (para respetar el orden, puedes ordenar después)
          const { data: seriesData, error: errSeries } = await this.supabase
            .from('serie')
            .select('*')
            .in('id', serieIds)
            .eq('activo', true);

          if (errSeries) throw new Error('Error obteniendo series: ' + errSeries.message);

          // Ordenar seriesData según el orden de serieIds
          const seriesOrdenadas = serieIds.map(id => seriesData?.find(s => s.id === id)).filter(Boolean);

          return seriesOrdenadas as Serie[];
        })
    ).pipe(
      catchError(error => { throw error; })
    );
  }

  existeSerieConNombre(nombre: string): Observable<boolean> {
    return from(
      this.supabase
        .from('serie')
        .select('id')
        .eq('nombre', nombre)
        .maybeSingle()
    ).pipe(
      map((response) => !!response.data),
      catchError(() => of(false)) // Si ocurre un error, asumimos que no existe
    );
  }

  existeSerieConSlug(slug: string): Observable<boolean> {
    return from(
      this.supabase
        .from('serie')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()
    ).pipe(
      map((response) => !!response.data),
      catchError(() => of(false))
    );
  }

  obtenerCarrusel(): Observable<Carrusel[]> {
    return from(
      this.supabase
        .from('carrusel')
        .select('*')
        .order('posicion', { ascending: true })
        .then(({ data, error }) => {
          if (error) throw new Error('Error obteniendo carrusel: ' + error.message);
          return data as Carrusel[];
        })
    ).pipe(
      catchError((error) => {
        throw error;
      })
    );
  }

  guardarCarrusel(carrusel: Carrusel[]): Observable<any> {
    return this.esUsuarioAdmin().pipe(
      switchMap((esAdmin) => {
        if (!esAdmin) {
          return throwError(() => new Error('Acceso denegado: solo los administradores pueden actualizar series'));
        }
        return from(
          this.supabase
            .from('carrusel')  // Asegúrate de que la tabla se llama así
            .upsert(carrusel, { onConflict: 'serie_id' })  // Actualiza si ya existe
            .select()  // Para devolver los datos actualizados si lo necesitas
        );
      })
    );
  }



}
