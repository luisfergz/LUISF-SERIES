import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SeriesService } from '../services/series.service';
import { CommonModule } from '@angular/common';
import { Comentario, Serie } from '../models/serie.model';
import { NgxSpinnerModule, NgxSpinnerService } from "ngx-spinner";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-detalles',
  standalone: true,
  imports: [CommonModule, NgxSpinnerModule, FormsModule],
  templateUrl: './detalles.component.html',
  styleUrls: ['./detalles.component.css']
})
export class DetallesComponent {
  serie: Serie | undefined = undefined;
  comentariosRaiz: Comentario[] = [];
  nuevoComentario: string = '';

  comentarioMostrandoRespuesta: number | null = null;
  respuestaContenido: string = '';

  comentariosConRespuestasVisibles = new Set<number>();

  constructor(
    private route: ActivatedRoute,
    private seriesService: SeriesService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.spinner.show();
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.seriesService.obtenerSeriePorSlug(slug).subscribe({
      next: async (data) => {
        this.serie = data;
        if (data?.id) {
          await this.cargarComentarios();
          console.log('comentarios', this.comentariosRaiz);
        }
        this.mostrarContenido();
      },
      error: (err) => {
        console.error('Error cargando la serie', err);
        this.mostrarContenido();
      },
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
    console.log('Comentarios planos:', comentarios);
    this.comentariosRaiz = this.construirArbolComentarios(comentarios);
    console.log('Comentarios arbol:', this.comentariosRaiz);
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

  mostrarFormularioRespuesta(id: number) {
    this.comentarioMostrandoRespuesta = id;
    this.respuestaContenido = '';
  }

  cancelarRespuesta() {
    this.comentarioMostrandoRespuesta = null;
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
}
