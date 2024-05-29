import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Observable, catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthInterceptorService implements HttpInterceptor {
  constructor(private authSrvice: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return from(
      Preferences.get({
        key: 'token',
      })
    ).pipe(
      switchMap((data: { value: string | null }) => {
        const token = data?.value;

        if (token) {
          const cloneRequest = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${token}`),
          });
          return next.handle(cloneRequest);
        }
        return next.handle(req);
      }),
      catchError((err: HttpErrorResponse) => {
        err.status === 401 ? this.authSrvice.logout() : null;
        console.error(err);
        return throwError(() => err);
      })
    );
  }
}
