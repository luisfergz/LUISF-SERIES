import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Carrusel, Comentario, InformacionTecnica, Serie, Temporada } from '../models/serie.model';
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

  async obtenerNombreUsuario(): Promise<string | null> {
    const { data: userData, error: userError } = await this.supabase.auth.getUser();
    if (userError || !userData?.user) return null;

    const userId = userData.user.id;

    const { data, error } = await this.supabase
      .from('perfiles')
      .select('usuario')
      .eq('id', userId)
      .single();

    if (error || !data?.usuario) return null;
    return data.usuario;
  }

  async guardarNombreUsuario(nombre: string): Promise<void> {
    const { data: userData, error: userError } = await this.supabase.auth.getUser();
    if (userError || !userData?.user) throw new Error('No hay sesión activa');

    const userId = userData.user.id;

    // Verificar si el nombre ya existe (en otro perfil)
    const { data: existentes, error: consultaError } = await this.supabase
      .from('perfiles')
      .select('id')
      .eq('usuario', nombre)
      .neq('id', userId); // evitar conflicto consigo mismo

    if (consultaError) throw new Error('Error al verificar nombre de usuario');
    if (existentes.length > 0) throw new Error('El nombre de usuario ya está en uso');

    // Guardar o actualizar el nombre
    const { error: updateError } = await this.supabase
      .from('perfiles')
      .upsert({ id: userId, usuario: nombre });

    if (updateError) throw new Error('Error al guardar el nombre de usuario');
  }

  async obtenerAvatarUrl(): Promise<string | null> {
    // Obtener usuario actual
    const { data: userData, error: userError } = await this.supabase.auth.getUser();
    if (userError || !userData?.user) return null;

    const userId = userData.user.id;

    // Leer ruta avatar desde tabla perfiles
    const { data: perfil, error: perfilError } = await this.supabase
      .from('perfiles')
      .select('avatar')
      .eq('id', userId)
      .single();

    if (perfilError || !perfil?.avatar) return null;

    // Obtener URL pública del storage usando la ruta guardada en perfiles.avatar
    const { data } = this.supabase.storage
      .from('avatars')
      .getPublicUrl(perfil.avatar);

    // Si quieres evitar cache con timestamp:
    return data?.publicUrl ? `${data.publicUrl}?t=${Date.now()}` : null;
  }

  async cambiarAvatar(file: File): Promise<void> {
    try {
      const { data: userData, error: userError } = await this.supabase.auth.getUser();
      if (userError || !userData?.user) throw new Error('No hay sesión activa');

      const userId = userData.user.id;
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension) throw new Error('Formato de archivo no válido');

      const filePath = `${userId}/avatar.${extension}`;

      // Eliminar archivos antiguos
      const { data: archivos, error: listError } = await this.supabase.storage.from('avatars').list(userId);
      if (listError) throw new Error('Error al listar archivos existentes');

      if (archivos && archivos.length > 0) {
        const archivosAEliminar = archivos.map(a => `${userId}/${a.name}`);
        const { error: deleteError } = await this.supabase.storage.from('avatars').remove(archivosAEliminar);
        if (deleteError) throw new Error('Error al eliminar archivos antiguos');
      }

      // Subir nuevo avatar
      const { error: uploadError } = await this.supabase.storage.from('avatars').upload(filePath, file, {
        cacheControl: '3600'
      });
      if (uploadError) throw new Error('Error al subir el avatar');

      // **Actualizar tabla perfiles con la ruta del avatar**
      const { error: updateError } = await this.supabase
        .from('perfiles')
        .update({ avatar: filePath })
        .eq('id', userId);

      if (updateError) throw new Error('Error al actualizar avatar en perfiles');

    } catch (error) {
      console.error('Error en cambiarAvatar:', error);
      throw error;
    }
  }

  // async obtenerComentariosPorSerie(serieId: number): Promise<Comentario[]> {
  //   const { data, error } = await this.supabase
  //     .from('comentario')
  //     .select(`
  //       id,
  //       serie_id,
  //       autor_id,
  //       contenido,
  //       fecha,
  //       respuesta_a,
  //       perfiles (
  //         usuario,
  //         avatar
  //       )
  //     `)
  //     .eq('serie_id', serieId)
  //     .order('fecha', { ascending: true });

  //   if (error || !data) {
  //     console.error('Error al obtener comentarios:', error);
  //     return [];
  //   }

  //   // Agregar URL pública avatar
  //   const comentariosConAvatares = data.map((comentario: any) => {
  //     let avatarUrl = 'general/user-default.jpg';

  //     if (comentario.perfiles?.avatar) {
  //       const { data: avatarData } = this.supabase.storage
  //         .from('avatars')
  //         .getPublicUrl(comentario.perfiles.avatar);
  //       if (avatarData?.publicUrl) avatarUrl = avatarData.publicUrl;
  //     }

  //     return {
  //       ...comentario,
  //       perfiles: {
  //         usuario: comentario.perfiles?.usuario || 'Anónimo',
  //         avatarUrl,
  //       },
  //       respuestas: [], // Inicializa respuestas aquí para evitar undefined
  //     };
  //   });

  //   return comentariosConAvatares;
  // }

  async obtenerComentariosPorSerie(serieId: number): Promise<Comentario[]> {
    // Obtener el ID del usuario actual
    const user = (await this.supabase.auth.getUser()).data.user;
    const userId = user?.id;

    const { data, error } = await this.supabase
      .from('comentario')
      .select(`
        id,
        serie_id,
        autor_id,
        contenido,
        fecha,
        respuesta_a,
        perfiles (
          usuario,
          avatar
        ),
        comentario_likes (
          usuario_id
        )
      `)
      .eq('serie_id', serieId)
      .order('fecha', { ascending: true });

    if (error || !data) {
      console.error('Error al obtener comentarios:', error);
      return [];
    }

    // Procesar cada comentario
    const comentariosConAvatares = data.map((comentario: any) => {
      // Avatar
      let avatarUrl = 'general/user-default.jpg';
      if (comentario.perfiles?.avatar) {
        const { data: avatarData } = this.supabase.storage
          .from('avatars')
          .getPublicUrl(comentario.perfiles.avatar);
        if (avatarData?.publicUrl) avatarUrl = avatarData.publicUrl;
      }

      // Likes
      const likes = comentario.comentario_likes || [];
      const likes_count = likes.length;
      const liked_by_user = likes.some((like: any) => like.usuario_id === userId);

      return {
        ...comentario,
        perfiles: {
          usuario: comentario.perfiles?.usuario || 'Anónimo',
          avatarUrl,
        },
        respuestas: [],
        likes_count,
        liked_by_user,
        editando: false
      };
    });

    return comentariosConAvatares;
  }


  async agregarComentario(comentario: {
    serie_id: number;
    contenido: string;
    respuesta_a: number | null;
  }): Promise<void> {
    const { data: userData, error: userError } = await this.supabase.auth.getUser();
    if (userError || !userData?.user) throw new Error('No autenticado');

    const { error } = await this.supabase.from('comentario').insert({
      serie_id: comentario.serie_id,
      contenido: comentario.contenido,
      respuesta_a: comentario.respuesta_a,
      autor_id: userData.user.id,
      fecha: new Date().toISOString(),
    });

    if (error) throw error;
  }

  // Obtener likes por comentario (contar y verificar si el usuario dio like)
  async obtenerLikesComentario(comentarioId: number): Promise<{ count: number, likedByUser: boolean }> {
    const user = await this.supabase.auth.getUser();
    const userId = user.data?.user?.id;
    if (!userId) return { count: 0, likedByUser: false };

    const { count } = await this.supabase
      .from('comentario_likes')
      .select('*', { count: 'exact', head: true })
      .eq('comentario_id', comentarioId);

    const { data: likeData } = await this.supabase
      .from('comentario_likes')
      .select('id')
      .eq('comentario_id', comentarioId)
      .eq('usuario_id', userId)
      .maybeSingle();

    return {
      count: count ?? 0,
      likedByUser: !!likeData
    };
  }

  async darLike(comentarioId: number) {
    const user = await this.supabase.auth.getUser();
    const userId = user.data?.user?.id;
    if (!userId) throw new Error('No autenticado');

    return this.supabase
      .from('comentario_likes')
      .insert({ comentario_id: comentarioId, usuario_id: userId });
  }

  async quitarLike(comentarioId: number) {
    const user = await this.supabase.auth.getUser();
    const userId = user.data?.user?.id;
    if (!userId) throw new Error('No autenticado');

    return this.supabase
      .from('comentario_likes')
      .delete()
      .eq('comentario_id', comentarioId)
      .eq('usuario_id', userId);
  }


  async verificarOCrearPerfil(): Promise<void> {
    const { data: userData, error: userError } = await this.supabase.auth.getUser();
    if (userError || !userData?.user) throw new Error('No hay sesión activa');

    const user = userData.user;
    const userId = user.id;

    // 1. Verificar si ya existe el perfil
    const { data: perfil, error: perfilError } = await this.supabase
      .from('perfiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (perfilError) throw new Error('Error al verificar el perfil');

    // 2. Si no existe, crear uno
    if (!perfil) {
      const { error: insertError } = await this.supabase
        .from('perfiles')
        .insert({
          id: userId,
          rol: 'usuario'
        });

      if (insertError) throw new Error('Error al crear el perfil');
    }
  }

  async editarComentario(comentarioId: number, nuevoContenido: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('comentario')
      .update({ contenido: nuevoContenido, fecha: new Date().toISOString() }) // Puedes actualizar también la fecha
      .eq('id', comentarioId);

    if (error) {
      console.error('Error al editar comentario:', error);
      return false;
    }
    return true;
  }

  async borrarComentario(comentarioId: number): Promise<boolean> {
    const { error } = await this.supabase
      .from('comentario')
      .delete()
      .eq('id', comentarioId);

    if (error) {
      console.error('Error al borrar comentario:', error);
      return false;
    }
    return true;
  }

  async esAutorComentario(comentarioId: number, usuarioId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('comentario')
      .select('autor_id')
      .eq('id', comentarioId)
      .single();

    if (error || !data) return false;

    return data.autor_id === usuarioId;
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
