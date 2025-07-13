import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SeriesService } from '../services/series.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gestionar-series',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gestionar-series.component.html',
  styleUrl: './gestionar-series.component.css'
})
export class GestionarSeriesComponent {

  busqueda = '';
  seriesFiltradas: any[] = [];

  constructor(private seriesService: SeriesService, private router: Router) {}

  ngOnInit() {
    this.seriesService.obtenerSeries().subscribe({
      next: (data) => {
        this.seriesFiltradas = data;
      },
      error: (err) => {
        console.error('Error obteniendo series:', err);
      }
    });
  }

  agregarSerie() {
    this.router.navigate(['/agregar-serie']);
  }

  filtrarSeries() {
    this.seriesFiltradas = this.seriesFiltradas.filter((serie) => {
      return serie.nombre.toLowerCase().includes(this.busqueda.toLowerCase());
    });
  }
}
