import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SeriesService } from '../services/series.service';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const seriesService = inject(SeriesService);
  const authService = inject(AuthService);

  try {
    const user = await authService.getUser();
    if (!user) {
      router.navigate(['/login']);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error en authGuard:', error);
    router.navigate(['/login']);
    return false;
  }
};

export const adminGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const seriesService = inject(SeriesService);

  try {
    const esAdmin = await firstValueFrom(seriesService.esUsuarioAdmin());
    if (!esAdmin) {
      router.navigate(['/login']);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error en adminGuard:', error);
    router.navigate(['/login']);
    return false;
  }
};


// import { inject } from '@angular/core';
// import { CanActivateFn, Router } from '@angular/router';
// import { SeriesService } from '../services/series.service';

// export const authGuard: CanActivateFn = async () => {
//   const router = inject(Router);
//   const supabaseService = inject(SeriesService);

//   const { data, error } = await supabaseService.client.auth.getSession();
//   const isLoggedIn = !!data.session;

//   if (!isLoggedIn) {
//     router.navigate(['/admin']);
//     return false;
//   }

//   return true;
// };
