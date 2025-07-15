import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SeriesService } from '../services/series.service';
import { Router, RouterModule } from '@angular/router';
import { Serie } from '../models/serie.model';
import { FormsModule } from '@angular/forms';

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

  constructor(private seriesService: SeriesService, private router: Router) { }

  ngOnInit() {
    this.seriesService.obtenerSeries().subscribe({
      next: (data) => {
        this.series = data;
        this.filtrarSeries();
      },
      error: (err) => {
        console.error('Error obteniendo series:', err);
      }
    });
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

    // Ordenar por fecha
    if (this.filtroFecha === 'recientes' || this.filtroFecha === 'antiguos') {
      resultado.sort((a, b) => new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime());
    }

    this.seriesFiltradas = resultado;
  }


  agregarSerie() {
    this.router.navigate(['/agregar-serie']);
  }

  editarSerie(serie: Serie) {
    this.router.navigate(['/editar-serie', serie.id]);
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
