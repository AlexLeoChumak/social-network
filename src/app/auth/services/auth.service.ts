import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  Observable,
  catchError,
  from,
  map,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { GetResult, Preferences } from '@capacitor/preferences';
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

  get userFullImagePath(): Observable<string> {
    return this.user$.asObservable().pipe(
      switchMap((userResponse: UserResponse | null) => {
        return of(
          userResponse?.user?.imagePath
            ? this.getFullImagePath(userResponse.user.imagePath)
            : this.getDefaultFullImagePath()
        );
      })
    );
  }

  getDefaultFullImagePath(): string {
    return `${environment.baseApiUrl}/feed/image/blank-profile-picture.png`;
  }

  getFullImagePath(imagePath: string): string {
    return `${environment.baseApiUrl}/feed/image/${imagePath}`;
  }

  getUserImage() {
    return this.http.get(`${environment.baseApiUrl}/user/image`);
  }

  getUserImageName(): Observable<{ imageName: string }> {
    return this.http.get<{ imageName: string }>(
      `${environment.baseApiUrl}/user/image-name`
    );
  }

  updateUserImagePath(imagePath: string): Observable<UserResponse | null> {
    return this.user$.pipe(
      map((userResponse: UserResponse | null) => {
        if (userResponse) {
          userResponse.user.imagePath = imagePath;
          this.user$.next(userResponse);
        }
        return userResponse;
      })
    );
  }

  // проверка авторизации без Observable
  // get isUserLoggedIn(): boolean {
  //   return !!this.user$.getValue();
  // }

  get isUserLoggedIn(): Observable<boolean> {
    return this.user$.asObservable().pipe(
      switchMap((userResponse: UserResponse | null) => {
        return of(!!userResponse);
      })
    );
  }

  get currentUser(): Observable<UserResponse | null> {
    return this.user$.asObservable().pipe(
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      })
    );
  }

  get userRole(): Observable<Role | null> {
    return this.user$.asObservable().pipe(
      switchMap((userResponse: UserResponse | null) => {
        return userResponse?.user ? of(userResponse.user.role) : of(null);
      }),
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
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

          this.router.navigate(['/']);
        }),
        catchError((err) => {
          console.error(err);
          return throwError(() => err);
        })
      );
  }

  isTokenInStorage(): Observable<boolean> {
    return from(
      Preferences.get({
        key: 'token',
      })
    ).pipe(
      switchMap((data: GetResult) => {
        if (!data || !data.value) return of(false);

        const decodedToken: any = jwtDecode(data.value);

        const isExpired = new Date() > new Date(decodedToken.exp * 1000);

        if (isExpired) return of(false);

        if (decodedToken.user) {
          this.user$.next(decodedToken);

          return of(true);
        }
        return of(false);
      }),
      catchError((err) => {
        console.error(err);
        this.logout();
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    this.user$.next(null);
    this.router.navigate(['/auth']);
    Preferences.remove({ key: 'token' });
  }
}
