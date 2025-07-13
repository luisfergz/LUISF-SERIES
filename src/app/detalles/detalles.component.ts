import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SeriesService } from '../services/series.service';
import { CommonModule } from '@angular/common';
import { Serie } from '../models/serie.model';
import { NgxSpinnerModule, NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-detalles',
  standalone: true,
  imports: [CommonModule, NgxSpinnerModule],
  templateUrl: './detalles.component.html',
  styleUrls: ['./detalles.component.css']
})
export class DetallesComponent {

  serie: Serie | undefined;
  loading: boolean = true; // Estado de carga

  constructor(
    private route: ActivatedRoute,
    private seriesService: SeriesService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.spinner.show(); // Mostrar spinner
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.seriesService.obtenerSeriePorSlug(slug).subscribe({
      next: (data) => {
        this.serie = data;
        this.loading = false; // Ocultar spinner cuando los datos se cargan
        this.spinner.hide();
        console.log('Serie cargada:', this.serie);
      },
      error: (err) => {
        console.error('Error cargando la serie', err);
        this.loading = false; // Ocultar spinner en caso de error
        this.spinner.hide();
      },
    });
  }
}
