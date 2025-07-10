import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SeriesService } from '../services/series.service';

export const authGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const supabaseService = inject(SeriesService);

  const { data, error } = await supabaseService.client.auth.getSession();
  const isLoggedIn = !!data.session;

  if (!isLoggedIn) {
    router.navigate(['/admin']);
    return false;
  }

  return true;
};
