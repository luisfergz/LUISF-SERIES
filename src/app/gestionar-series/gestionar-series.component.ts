import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SeriesService } from '../services/series.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import * as bootstrap from 'bootstrap'; // Importar Bootstrap JS

@Component({
  selector: 'app-gestionar-series',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './gestionar-series.component.html',
  styleUrl: './gestionar-series.component.css'
})
export class GestionarSeriesComponent {
  busqueda = '';
  filtroNombre = 'az';
  filtroFecha = 'todos';
  series: any[] = [];
  seriesFiltradas: any[] = [];

  serieAEliminar: any = null; // Guarda la serie seleccionada

  constructor(
    private seriesService: SeriesService,
    private router: Router,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.spinner.show();
    this.seriesService.obtenerSeriesCompletas().subscribe({
      next: (data) => {
        this.series = data;
        this.filtrarSeries();
        this.mostrarContenido();
      },
      error: (err) => {
        console.error('Error obteniendo series:', err);
        this.mostrarContenido();
      }
    });
  }

  mostrarContenido() {
    this.spinner.hide();
    const gestionarSeries = document.getElementById('gestionar-series');
    if (gestionarSeries) {
      gestionarSeries.classList.add('active');
    }
  }

  filtrarSeries() {
    let resultado = [...this.series];

    if (this.busqueda?.trim()) {
      resultado = resultado.filter(serie =>
        serie.nombre.toLowerCase().includes(this.busqueda.toLowerCase())
      );
    }

    if (this.filtroNombre === 'az') {
      resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (this.filtroNombre === 'za') {
      resultado.sort((a, b) => b.nombre.localeCompare(a.nombre));
    }

    if (this.filtroFecha === 'recientes') {
      resultado.sort((a, b) => new Date(b.creado ?? 0).getTime() - new Date(a.creado ?? 0).getTime());
    } else if (this.filtroFecha === 'antiguos') {
      resultado.sort((a, b) => new Date(a.creado ?? 0).getTime() - new Date(b.creado ?? 0).getTime());
    }

    this.seriesFiltradas = resultado;
  }

  agregarSerie() {
    this.router.navigate(['/agregar-serie']);
  }

  abrirModalEliminar(serie: any) {
    this.serieAEliminar = serie;
    const modal = new bootstrap.Modal(document.getElementById('modalEliminar')!);
    modal.show();
  }

  confirmarEliminacion() {
    if (!this.serieAEliminar) return;

    this.seriesService.eliminarSerie(this.serieAEliminar.id).subscribe({
      next: () => {
        this.series = this.series.filter(s => s.id !== this.serieAEliminar.id);
        this.seriesFiltradas = this.seriesFiltradas.filter(s => s.id !== this.serieAEliminar.id);
        this.serieAEliminar = null;
        bootstrap.Modal.getInstance(document.getElementById('modalEliminar')!)?.hide();
      },
      error: (error) => {
        console.error('Error al eliminar la serie:', error);
      }
    });
  }
}
