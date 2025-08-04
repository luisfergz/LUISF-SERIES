import { SeriesComponent } from './series/series.component';
import { Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { PeliculasComponent } from './peliculas/peliculas.component';
import { BlogComponent } from './blog/blog.component';
import { DetallesComponent } from './detalles/detalles.component';
import { AdminComponent } from './admin/admin.component';
import { authGuard, adminGuard } from './guards/auth.guard';
import { GestionarSeriesComponent } from './gestionar-series/gestionar-series.component';
import { SerieFormularioComponent } from './serie-formulario/serie-formulario.component';
import { CarruselComponent } from './carrusel/carrusel.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { RecuperarPasswordComponent } from './recuperar-password/recuperar-password.component';
import { PerfilComponent } from './perfil/perfil.component';

export const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'series', component: SeriesComponent },
  { path: 'peliculas', component: PeliculasComponent },
  { path: 'blog', component: BlogComponent },
  { path: 'series/:slug', component: DetallesComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'perfil', component: PerfilComponent, canActivate: [authGuard] },
  { path: 'recuperar-password', component: RecuperarPasswordComponent, canActivate: [authGuard] },
  { path: 'agregar-serie', component: SerieFormularioComponent, canActivate: [adminGuard] },
  { path: 'editar-serie/:id', component: SerieFormularioComponent, canActivate: [adminGuard] },
  { path: 'gestionar-series', component: GestionarSeriesComponent, canActivate: [adminGuard] },
  { path: 'carrusel', component: CarruselComponent, canActivate: [adminGuard] },
];
