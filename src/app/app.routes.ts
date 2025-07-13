import { SeriesComponent } from './series/series.component';
import { Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { PeliculasComponent } from './peliculas/peliculas.component';
import { BlogComponent } from './blog/blog.component';
import { DetallesComponent } from './detalles/detalles.component';
import { AdminComponent } from './admin/admin.component';
import { AgregarSerieComponent } from './agregar-serie/agregar-serie.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'series', component: SeriesComponent },
  { path: 'peliculas', component: PeliculasComponent },
  { path: 'blog', component: BlogComponent },
  { path: 'series/:slug', component: DetallesComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'agregar-serie', component: AgregarSerieComponent, canActivate: [authGuard] },
];
