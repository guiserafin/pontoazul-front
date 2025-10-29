import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        console.error('HTTP error', {
          url: error.url,
          status: error.status,
          message: error.message,
          payload: error.error
        });
      }

      return throwError(() => error);
    })
  );
