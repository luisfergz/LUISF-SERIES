import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SeriesService } from '../services/series.service';
import { Router, RouterModule } from '@angular/router';
import { Serie } from '../models/serie.model';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';

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
  series: any[] = [];      // <- Lista original completa
  seriesFiltradas: any[] = [];

  constructor(private seriesService: SeriesService, private router: Router, private spinner: NgxSpinnerService) { }

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

    // Ordenar por nombre
    if (this.filtroNombre === 'az') {
      resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (this.filtroNombre === 'za') {
      resultado.sort((a, b) => b.nombre.localeCompare(a.nombre));
    }

    if (this.filtroFecha === 'recientes') {
      resultado.sort((a, b) => new Date(b.creado).getTime() - new Date(a.creado).getTime()); // descendente
    } else if (this.filtroFecha === 'antiguos') {
      resultado.sort((a, b) => new Date(a.creado).getTime() - new Date(b.creado).getTime()); // ascendente
    }

    this.seriesFiltradas = resultado;
  }

  agregarSerie() {
    this.router.navigate(['/agregar-serie']);
  }

  eliminarSerie(id: number) {
    this.seriesService.eliminarSerie(id).subscribe({
      next: () => {
        this.seriesFiltradas = this.seriesFiltradas.filter((serie) => serie.id !== id);
      },
      error: (error) => {
        console.error('Error al eliminar la serie:', error);
      }
    });
  }
}
