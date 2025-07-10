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
  vlc: string = 'https://www.videolan.org/vlc';
  tutorial: string = 'https://www.youtube.com/@LuisF-Series';
  loading: boolean = true; // Estado para controlar la carga

  constructor(
    private seriesService: SeriesService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.spinner.show();
    this.seriesService.getSeries().subscribe({
      next: (data) => {
        this.series = data;
        this.seriesFiltradas = data;
        this.spinner.hide();
      },
      error: (err) => {
        console.error('Error cargando series', err);
        this.spinner.hide();
      },
    });
  }

  filtrarSeries(): void {
    if (this.busqueda.trim() === '') {
      this.seriesFiltradas = this.series;
    } else {
      const lowerCaseSearch = this.busqueda.toLowerCase();
      this.seriesFiltradas = this.series.filter((serie) =>
        serie.nombre.toLowerCase().includes(lowerCaseSearch)
      );
    }
  }
}
