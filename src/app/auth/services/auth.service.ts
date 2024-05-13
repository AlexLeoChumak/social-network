import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { Preferences } from '@capacitor/preferences';
import { jwtDecode } from 'jwt-decode';

import { NewUser } from '../models/newUser.interface';
import { User } from '../models/user.interface';
import { environment } from 'src/environments/environment';
import { UserResponse } from '../models/userResponse.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient, private router: Router) {}

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
          console.log('decodedToken', decodedToken);
        }),
        catchError((err) => {
          console.error(err);
          return throwError(() => err);
        })
      );
  }
}
