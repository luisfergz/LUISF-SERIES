import { SeriesComponent } from './series/series.component';
import { Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { PeliculasComponent } from './peliculas/peliculas.component';
import { BlogComponent } from './blog/blog.component';
import { DetallesComponent } from './detalles/detalles.component';

export const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'series', component: SeriesComponent },
  { path: 'peliculas', component: PeliculasComponent },
  { path: 'blog', component: BlogComponent },
  { path: 'series/:id', component: DetallesComponent },
];
