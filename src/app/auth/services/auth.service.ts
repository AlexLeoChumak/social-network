import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Optional } from '@angular/core';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  EMPTY,
  Observable,
  catchError,
  from,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { GetResult, Preferences } from '@capacitor/preferences';
import { jwtDecode } from 'jwt-decode';

import { NewUser } from '../models/newUser.interface';
import { User } from '../models/user.interface';
import { environment } from 'src/environments/environment';
import { UserResponse } from '../models/userResponse.interface';
import { ConnectionProfileService } from 'src/app/home/services/connection-profile.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private user$: BehaviorSubject<UserResponse | null> =
    new BehaviorSubject<UserResponse | null>(null);

  private httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    @Optional() private connectionProfileService: ConnectionProfileService
  ) {}

  updateUserBehaviorSubject(newUser: UserResponse | null) {
    this.user$.next(newUser);
  }

  get userFullImagePath(): Observable<string> {
    return this.user$.asObservable().pipe(
      switchMap((userResponse: UserResponse | null) => {
        return of(
          userResponse?.user?.imagePath
            ? this.getFullImagePath(userResponse.user.imagePath)
            : this.getDefaultFullImagePath()
        );
      }),
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      })
    );
  }

  getFullImagePath(imagePath: string | undefined): string {
    return `${environment.baseApiUrl}/feed/image/${imagePath}`;
  }

  getDefaultFullImagePath(): string {
    return `${environment.baseApiUrl}/feed/image/default-user-image.jpg`;
  }

  getUserImage() {
    return this.http.get(`${environment.baseApiUrl}/user/image`).pipe(
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      })
    );
  }

  getUserImageName(): Observable<{ imageName: string }> {
    return this.http
      .get<{ imageName: string }>(`${environment.baseApiUrl}/user/image-name`)
      .pipe(
        catchError((err) => {
          console.error(err);
          return throwError(() => err);
        })
      );
  }

  uploadUserImage(formData: FormData): Observable<{ token: string }> {
    return this.http
      .post<{ imagePath: string }>(
        `${environment.baseApiUrl}/user/upload`,
        formData
      )
      .pipe(
        switchMap((responseWithImageName) => {
          const userResponse = this.user$.value;

          if (userResponse && responseWithImageName) {
            userResponse.user.imagePath = responseWithImageName.imagePath;
            this.updateUserBehaviorSubject(userResponse);
            return this.updatingTokenAfterChangingProfilePicture();
          }

          return EMPTY;
        }),
        catchError((err) => {
          console.error(err);
          return throwError(() => err);
        })
      );
  }

  updatingTokenAfterChangingProfilePicture(): Observable<{ token: string }> {
    const user = this.user$.value;

    return this.http
      .post<{ token: string }>(
        `${environment.baseApiUrl}/user/update-image`,
        user
      )
      .pipe(
        tap((response: { token: string }) => {
          Preferences.set({
            key: 'token',
            value: response.token,
          });
        }),
        catchError((err) => {
          console.error(err);
          return throwError(() => err);
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
      }),
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
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
          this.updateUserBehaviorSubject(decodedToken);
          this.connectionProfileService.getFriendRequestsForBehaviorSubject();
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
          this.updateUserBehaviorSubject(decodedToken);

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
    this.updateUserBehaviorSubject(null);
    this.router.navigate(['/auth']);
    Preferences.remove({ key: 'token' });
  }
}
