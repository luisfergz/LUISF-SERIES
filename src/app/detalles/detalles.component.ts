import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SeriesService } from '../services/series.service';
import { CommonModule } from '@angular/common';
import { Comentario, Serie } from '../models/serie.model';
import { NgxSpinnerModule, NgxSpinnerService } from "ngx-spinner";
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-detalles',
  standalone: true,
  imports: [CommonModule, NgxSpinnerModule, FormsModule, RouterModule],
  templateUrl: './detalles.component.html',
  styleUrls: ['./detalles.component.css']
})
export class DetallesComponent {
  serie: Serie | undefined = undefined;
  comentariosRaiz: Comentario[] = [];
  nuevoComentario: string = '';
  avatar: string | null = null;
  error: string | null = null;
  slug: string | null = null;
  serie_id: number | null = null;

  comentarioAResponder: Comentario | null = null;
  usuarioActualId: string | null = null;

  comentarioMostrandoRespuesta: number | null = null;
  respuestaContenido: string = '';

  comentariosConRespuestasVisibles = new Set<number>();
  ordenFecha: 'reciente' | 'antiguo' = 'reciente';

  esAdmin = false;

  constructor(
    private route: ActivatedRoute,
    private seriesService: SeriesService,
    private spinner: NgxSpinnerService,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    this.spinner.show();
    this.slug = this.route.snapshot.paramMap.get('slug')!;
    this.seriesService.obtenerIdPorSlug(this.slug!).subscribe(id => {
      this.serie_id = id;
    });
    this.seriesService.obtenerSeriePorSlug(this.slug).subscribe({
      next: async (data) => {
        this.serie = data;
        if (data?.id) {
          await this.cargarComentarios();

          const url = await this.seriesService.obtenerAvatarUrl();
          this.avatar = url || 'general/user-default.jpg';
        }
        this.mostrarContenido();
      },
      error: (err) => {
        console.error('Error cargando la serie', err);
        this.mostrarContenido();
      },
    });
    const user = await this.authService.getUser();
    this.usuarioActualId = user?.id ?? null;

    this.seriesService.esUsuarioAdmin().subscribe({
      next: (isAdmin) => {
        this.esAdmin = isAdmin || false;
      },
      error: () => {
        this.esAdmin = false;
      }
    });
  }

  mostrarContenido() {
    this.spinner.hide();
    const detalles = document.getElementById('detalles');
    if (detalles) detalles.classList.add('active');
  }

  async cargarComentarios(): Promise<void> {
    if (!this.serie) return;
    const comentarios = await this.seriesService.obtenerComentariosPorSerie(this.serie.id);
    this.comentariosRaiz = this.construirArbolComentarios(comentarios);
    this.ordenarComentarios();
  }

  construirArbolComentarios(comentarios: Comentario[]): Comentario[] {
    // Primero crear un mapa id -> comentario para acceso rápido
    const mapa = new Map<number, Comentario>();
    comentarios.forEach(c => {
      c.respuestas = [];
      mapa.set(c.id, c);
    });

    const raiz: Comentario[] = [];

    comentarios.forEach(c => {
      if (c.respuesta_a == null) {
        // Es comentario raíz
        raiz.push(c);
      } else {
        const padre = mapa.get(c.respuesta_a);
        if (padre) {
          padre.respuestas!.push(c);
        } else {
          // Si el padre no existe, considerar si añadirlo a raíz o ignorar
          raiz.push(c);
        }
      }
    });

    return raiz;
  }

  async agregarComentario() {
    if (!this.nuevoComentario.trim() || !this.serie) return;

    const user = await this.authService.getUser();
    if (!user) {
        window.location.href = '/login';
        return;
      }

    this.error = null;

    try {
      await this.seriesService.agregarComentario({
        serie_id: this.serie.id,
        contenido: this.nuevoComentario.trim(),
        respuesta_a: null
      });

      this.nuevoComentario = '';
      await this.cargarComentarios();
    } catch (error) {
      console.error('Error al agregar comentario:', error);
    }
  }

  fechaRelativa(fecha: string): string {
    return this.tiempoDesde(fecha);
  }

  tiempoDesde(fechaISO: string): string {
    const fecha = new Date(fechaISO);
    const ahora = new Date();
    const segundos = Math.floor((ahora.getTime() - fecha.getTime()) / 1000);

    const unidades = [
      { nombre: 'año(s)',   segundos: 31536000 },
      { nombre: 'mes(es)',  segundos: 2592000 },
      { nombre: 'semana(s)',segundos: 604800 },
      { nombre: 'día(s)',   segundos: 86400 },
      { nombre: 'hora(s)',  segundos: 3600 },
      { nombre: 'minuto(s)',segundos: 60 },
      { nombre: 'segundo(s)',segundos: 1 }
    ];

    for (const unidad of unidades) {
      const cantidad = Math.floor(segundos / unidad.segundos);
      if (cantidad >= 1) return `${cantidad} ${unidad.nombre}`;
    }

    return 'justo ahora';
  }

  mostrarFormularioRespuesta(id: number) {
    this.comentarioMostrandoRespuesta = id;
    this.respuestaContenido = '';
  }

  alternarRespuestas(comentarioId: number) {
    if (this.comentariosConRespuestasVisibles.has(comentarioId)) {
      this.comentariosConRespuestasVisibles.delete(comentarioId);
    } else {
      this.comentariosConRespuestasVisibles.add(comentarioId);
    }
  }

  toggleRespuestas(comentarioId: number) {
    if (this.comentariosConRespuestasVisibles.has(comentarioId)) {
      this.comentariosConRespuestasVisibles.delete(comentarioId);
    } else {
      this.comentariosConRespuestasVisibles.add(comentarioId);
    }
  }

  async responderComentario(respuestaA: number) {
    if (!this.respuestaContenido.trim() || !this.serie) return;

    try {
      await this.seriesService.agregarComentario({
        serie_id: this.serie.id,
        contenido: this.respuestaContenido.trim(),
        respuesta_a: respuestaA,
      });

      this.cancelarRespuesta();
      await this.cargarComentarios();
    } catch (err) {
      console.error('Error al responder comentario:', err);
    }
  }

  async toggleLike(comentario: Comentario) {
    try {
      if (comentario.liked_by_user) {
        await this.seriesService.quitarLike(comentario.id);
      } else {
        await this.seriesService.darLike(comentario.id);
      }

      // Refrescar likes
      const { count, likedByUser } = await this.seriesService.obtenerLikesComentario(comentario.id);
      comentario.likes_count = count;
      comentario.liked_by_user = likedByUser;
    } catch (error) {
      console.error('Error al dar/retirar like', error);
    }
  }

  responderA(comentario: Comentario) {
    this.comentarioAResponder = comentario;
    this.nuevoComentario = '';
    setTimeout(() => {
      const input = document.querySelector('#inputResponder') as HTMLTextAreaElement;
      if (input) input.focus();
    }, 0);
  }

  async enviarRespuesta() {
    if (!this.nuevoComentario.trim() || !this.comentarioAResponder || !this.serie) return;

    try {
      await this.seriesService.agregarComentario({
        serie_id: this.serie.id,
        contenido: this.nuevoComentario.trim(),
        respuesta_a: this.comentarioAResponder.id
      });

      this.nuevoComentario = '';
      this.comentarioAResponder = null;
      await this.cargarComentarios();
    } catch (error) {
      console.error('Error al responder comentario:', error);
    }
  }

  cancelarRespuesta() {
    this.nuevoComentario = '';
    this.comentarioAResponder = null;
    this.comentarioMostrandoRespuesta = null;
    this.respuestaContenido = '';
  }

  editarComentario(comentario: any) {
    comentario.editando = true;
    comentario.contenidoEditado = comentario.contenido;
  }

  async guardarEdicion(comentario: any) {
    const nuevoContenido = comentario.contenidoEditado.trim();
    if (!nuevoContenido) return;

    const exito = await this.seriesService.editarComentario(comentario.id, nuevoContenido);
    if (exito) {
      comentario.contenido = nuevoContenido;
    }
    comentario.editando = false;
  }

  cancelarEdicion(comentario: any) {
    comentario.editando = false;
    comentario.contenidoEditado = comentario.contenido; // Restaurar original
  }

  async borrarComentario(id: number) {
    const confirmar = confirm('¿Estás seguro de que quieres eliminar este comentario?');
    if (confirmar) {
      const exito = await this.seriesService.borrarComentario(id);
      if (exito) {
        await this.cargarComentarios();
      }
    }
  }

  ordenarComentarios() {
    if (this.ordenFecha === 'reciente') {
      this.comentariosRaiz.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    } else {
      this.comentariosRaiz.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    }
  }
}
