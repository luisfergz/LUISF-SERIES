import { SeriesComponent } from './series/series.component';
import { Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { PeliculasComponent } from './peliculas/peliculas.component';
import { BlogComponent } from './blog/blog.component';
import { DetallesComponent } from './detalles/detalles.component';
import { AdminComponent } from './admin/admin.component';
import { AgregarSerieComponent } from './agregar-serie/agregar-serie.component';
import { authGuard } from './guards/auth.guard';
import { GestionarSeriesComponent } from './gestionar-series/gestionar-series.component';
import { SerieFormularioComponent } from './serie-formulario/serie-formulario.component';

export const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'series', component: SeriesComponent },
  { path: 'peliculas', component: PeliculasComponent },
  { path: 'blog', component: BlogComponent },
  { path: 'series/:slug', component: DetallesComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'agregar-serie', component: SerieFormularioComponent, canActivate: [authGuard] },
  { path: 'editar-serie/:slug', component: SerieFormularioComponent, canActivate: [authGuard] },
  { path: 'gestionar-series', component: GestionarSeriesComponent, canActivate: [authGuard] },
];
