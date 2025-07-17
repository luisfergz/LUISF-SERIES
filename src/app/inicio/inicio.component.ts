import { Component, OnInit } from '@angular/core';
import { SeriesService } from '../services/series.service';
import { Serie } from '../models/serie.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxSpinnerModule],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent {
  canalUrl: string = 'https://www.youtube.com/@LuisF-Series';
  series: Serie[] | null = [];

  constructor(
    private seriesService: SeriesService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.spinner.show(); // Mostrar el spinner
    this.seriesService.obtenerSeriesParaCarrusel().subscribe({
      next: (data: Serie[]) => {
        this.series = data;
        this.mostrarContenido();
      },
      error: (error) => {
        console.error('Error al cargar las series:', error);
        this.mostrarContenido();
      }
    });
  }

  mostrarContenido() {
    this.spinner.hide();
    const inicio = document.getElementById('inicio');
    if (inicio) {
      inicio.classList.add('active');
    }
  }
}
