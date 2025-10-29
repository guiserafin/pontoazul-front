import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Token expirado ou inválido
      if (error.status === 401) {
        authService.clearToken();
        router.navigate(['/login'], {
          queryParams: { returnUrl: router.url, expired: 'true' }
        });
      }

      // Log do erro para debugging
      console.error('HTTP Error:', {
        status: error.status,
        message: error.message,
        url: error.url
      });

      return throwError(() => error);
    })
  );
};
