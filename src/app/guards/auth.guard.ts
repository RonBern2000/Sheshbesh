import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs';
import { UserHttpApiService } from '../services/user-http-api.service';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const auth = inject(UserHttpApiService);
  const router = inject(Router);

  return auth.isAuth().pipe(
    map(isAuth => {
      if (!isAuth) {
        router.navigate(['']);
        return false;
      }
      return true;
    })
  );
};
