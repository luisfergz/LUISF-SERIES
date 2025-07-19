import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SeriesService } from '../services/series.service';
import { Serie } from '../models/serie.model';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerService, NgxSpinnerModule } from 'ngx-spinner';

@Component({
  selector: 'app-series',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgxSpinnerModule],
  templateUrl: './series.component.html',
  styleUrls: ['./series.component.css'],
})
export class SeriesComponent {
  series: Serie[] = [];
  seriesFiltradas: Serie[] = [];
  busqueda: string = '';
  filtroNombre: string = 'az';
  filtroFecha: string = 'todos';
  vlc: string = 'https://www.videolan.org/vlc';
  tutorial: string = 'https://www.youtube.com/@LuisF-Series';
  loading: boolean = true; // Estado para controlar la carga

  constructor(
    private seriesService: SeriesService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.spinner.show();
    this.seriesService.obtenerSeries().subscribe({
      next: (data) => {
        this.series = data;
        this.filtrarSeries();
        this.mostrarContenido();
      },
      error: (err) => {
        console.error('Error cargando series', err);
        this.mostrarContenido();
      },
    });
  }

  mostrarContenido() {
    this.spinner.hide();
    const series = document.getElementById('series');
    if (series) {
      series.classList.add('active');
    }
  }

  filtrarSeries() {
    let resultado = [...this.series];

    if (this.busqueda?.trim()) {
      resultado = resultado.filter(serie =>
        serie.nombre.toLowerCase().includes(this.busqueda.toLowerCase())
      );
    }

    // Ordenar por nombre
    if (this.filtroNombre === 'az') {
      resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (this.filtroNombre === 'za') {
      resultado.sort((a, b) => b.nombre.localeCompare(a.nombre));
    }

    if (this.filtroFecha === 'recientes') {
      resultado.sort((a, b) => new Date(b.creado ?? 0).getTime() - new Date(a.creado ?? 0).getTime()); // descendente
    } else if (this.filtroFecha === 'antiguos') {
      resultado.sort((a, b) => new Date(a.creado ?? 0).getTime() - new Date(b.creado ?? 0).getTime()); // ascendente
    }

    this.seriesFiltradas = resultado;
  }
}
