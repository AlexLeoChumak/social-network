import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  Observable,
  catchError,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { Preferences } from '@capacitor/preferences';
import { jwtDecode } from 'jwt-decode';

import { NewUser } from '../models/newUser.interface';
import { Role, User } from '../models/user.interface';
import { environment } from 'src/environments/environment';
import { UserResponse } from '../models/userResponse.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private user$ = new BehaviorSubject<UserResponse | null>(null);

  private httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient, private router: Router) {}

  get isUserLoggedIn(): Observable<boolean> {
    return this.user$.asObservable().pipe(
      switchMap((userResponse: UserResponse | null) => {
        const isUserAuthenticated = userResponse !== null;
        return of(isUserAuthenticated);
      })
    );
  }

  registerUser(newUser: NewUser): Observable<User> {
    return this.http
      .post<User>(
        `${environment.baseApiUrl}/auth/register`,
        newUser,
        this.httpOptions
      )
      .pipe(
        catchError((err) => {
          console.error(err);
          return throwError(() => err);
        })
      );
  }

  login(email: string, password: string): Observable<{ token: string }> {
    return this.http
      .post<{ token: string }>(`${environment.baseApiUrl}/auth/login`, {
        email,
        password,
      })
      .pipe(
        tap((response: { token: string }) => {
          Preferences.set({
            key: 'token',
            value: response.token,
          });

          const decodedToken: UserResponse = jwtDecode(response.token);
          this.user$.next(decodedToken);
        }),
        catchError((err) => {
          console.error(err);
          return throwError(() => err);
        })
      );
  }
}
