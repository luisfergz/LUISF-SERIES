import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SeriesService } from '../services/series.service';
import { Carrusel, CarruselConSerie, Serie } from '../models/serie.model';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { NgxSpinnerService } from 'ngx-spinner';
import { F } from '@angular/cdk/keycodes';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-carrusel',
  standalone: true,
  imports: [CommonModule, DragDropModule, FormsModule],
  templateUrl: './carrusel.component.html',
  styleUrl: './carrusel.component.css'
})
export class CarruselComponent {
  carrusel: Carrusel[] | null = [];
  carruselConSerie: CarruselConSerie[] = [];
  series: Serie[] = [];
  todasLasSeries: Serie[] = [];
  seriesSeleccionadas = new Set<number>();

  constructor(private seriesService: SeriesService, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.spinner.show();
    this.actualizarCarrusel();
  }

  actualizarCarrusel() {
    this.carruselConSerie = [];
    this.seriesService.obtenerCarrusel().subscribe({
      next: (data: any[]) => {
        this.carrusel = data;
        this.carrusel.forEach(serie => this.seriesService.obtenerSeriePorId(serie.serie_id).subscribe({
          next: (data: Serie | undefined) => {
            if (data) {
              this.carruselConSerie.push({
                serie: data,
                posicion: serie.posicion
              });
              this.carruselConSerie.sort((a, b) => a.posicion - b.posicion);
            }
            this.mostrarContenido();
          },
          error: (error) => {
            console.error('Error al cargar la serie:', error);
            this.mostrarContenido();
          }
        }));
      },
      error: (error) => {
        console.error('Error al cargar el carrusel:', error);
        this.mostrarContenido();
      }
    });
    this.mostrarContenido();
  }

  mostrarContenido() {
    this.spinner.hide();
    const carrusel = document.getElementById('carrusel');
    if (carrusel) {
      carrusel.classList.add('active');
    }
  }

  reordenarCarrusel(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.carruselConSerie, event.previousIndex, event.currentIndex);

    // Opcional: Actualiza las posiciones si es necesario
    this.carruselConSerie.forEach((item, index) => {
      item.posicion = index + 1;
    });

    // Aquí podrías llamar a un servicio para guardar el nuevo orden en Supabase
  }

  agregarSerieAlCarrusel() {
    // Obtén todas las series desde tu servicio
    this.seriesService.obtenerSeries().subscribe({
      next: (series) => {
        this.todasLasSeries = series;
        const modal = (window as any).bootstrap?.Modal.getOrCreateInstance('#modalAgregarSerie');
        modal.show();
      },
      error: () => this.mostrarModal('Error al obtener las series.', 'error')
    });
  }

  toggleSeleccionSerie(serie: Serie) {
    if (this.seriesSeleccionadas.has(serie.id)) {
      this.seriesSeleccionadas.delete(serie.id);
    } else {
      this.seriesSeleccionadas.add(serie.id);
    }
  }

  confirmarAgregarSeries() {
    const seleccionadas = this.todasLasSeries.filter(s => this.seriesSeleccionadas.has(s.id));
    const posicionInicial = this.carruselConSerie.length + 1;

    seleccionadas.forEach((serie, index) => {
      this.carruselConSerie.push({
        posicion: posicionInicial + index,
        serie: serie
      });
    });

    this.seriesSeleccionadas.clear();
  }

  guardarOrdenCarrusel() {
    const datos: Carrusel[] = this.carruselConSerie.map((item, index) => ({
      serie_id: item.serie.id,
      posicion: index + 1
    }));
    this.seriesService.guardarCarrusel(datos).subscribe({
      next: () => this.mostrarModal('Orden del carrusel guardado con éxito.', 'exito'),
      error: (err) => this.mostrarModal(`Error al guardar carrusel: ${err.message}`, 'error')
    });
  }


  eliminarSerieDelCarrusel(index: number) {
    this.carruselConSerie.splice(index, 1);
    this.ordenarCarrusel();
  }

  ordenarCarrusel() {
    this.carruselConSerie.sort((a, b) => a.posicion - b.posicion);
    this.carruselConSerie.forEach((item, i) => item.posicion = i + 1);
  }


  mostrarModal(mensaje: string, tipo: 'exito' | 'error' | 'aviso' = 'aviso') {
    const mensajeElemento = document.getElementById('modalMensaje');
    const header = document.getElementById('divHeader');
    const boton = document.getElementById('modalBoton');

    if (mensajeElemento) mensajeElemento.textContent = mensaje;

    // Establecer clases según tipo
    if (header && boton) {
      switch (tipo) {
        case 'exito':
          header.classList.add('bg-success', 'text-white');
          boton.classList.add('btn-success');
          break;
        case 'error':
          header.classList.add('bg-danger', 'text-white');
          boton.classList.add('btn-danger');
          break;
        case 'aviso':
        default:
          header.classList.add('bg-warning', 'text-dark');
          boton.classList.add('btn-warning');
          break;
      }
    }

    const modalElement = document.getElementById('modalAlerta');
    const modal = (window as any).bootstrap?.Modal.getOrCreateInstance(modalElement);
    modal.show();

  }

  cancelarCarrusel() {
    this.actualizarCarrusel();
  }

  get seriesDisponibles(): Serie[] {
    const idsCarrusel = this.carruselConSerie.map(c => c.serie.id);
    return this.todasLasSeries.filter(s => !idsCarrusel.includes(s.id));
  }
}
