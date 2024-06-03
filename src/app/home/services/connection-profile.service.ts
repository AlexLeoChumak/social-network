import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  EMPTY,
  Observable,
  Subject,
  catchError,
  switchMap,
  takeUntil,
  tap,
  throwError,
} from 'rxjs';

import { User } from 'src/app/auth/models/user.interface';
import { environment } from 'src/environments/environment';
import {
  FriendRequest,
  FriendRequestStatus,
} from '../models/friend-request.interface';

@Injectable({
  providedIn: 'root',
})
export class ConnectionProfileService {
  private friendRequests$: BehaviorSubject<FriendRequest[]> =
    new BehaviorSubject<FriendRequest[]>([]);

  private destroy$: Subject<void> = new Subject<void>();

  private httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) {}

  get friendRequests(): Observable<FriendRequest[]> {
    return this.friendRequests$.asObservable();
  }

  setFriendRequests(newRequests: FriendRequest[]) {
    this.friendRequests$.next(newRequests);
  }

  getFriendRequestsForBehaviorSubject(): void {
    this.getFriendRequest()
      .pipe(
        tap((friendRequests: FriendRequest[]) => {
          this.setFriendRequests(friendRequests);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  //при уничтожении HeaderComponent будет вызван его ngOnDestroy, который вызов метод ниже - unsubscribe()
  unsubscribe() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getConnectionUser(id: number): Observable<User> {
    return this.http.get<User>(`${environment.baseApiUrl}/user/${id}`).pipe(
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      })
    );
  }

  getFriendRequestStatus(id: number): Observable<FriendRequestStatus> {
    return this.http
      .get<FriendRequestStatus>(
        `${environment.baseApiUrl}/user/friend-request/status/${id}`
      )
      .pipe(
        catchError((err) => {
          console.error(err);
          return throwError(() => err);
        })
      );
  }

  addConnectionUser(id: number): Observable<FriendRequest | { error: string }> {
    return this.http
      .post<FriendRequest | { error: string }>(
        `${environment.baseApiUrl}/user/friend-request/send/${id}`,
        {},
        this.httpOptions
      )
      .pipe(
        catchError((err) => {
          console.error(err);
          return throwError(() => err);
        })
      );
  }

  getFriendRequest(): Observable<FriendRequest[]> {
    return this.http
      .get<FriendRequest[]>(
        `${environment.baseApiUrl}/user/friend-request/me/received-requests`
      )
      .pipe(
        catchError((err) => {
          console.error(err);
          return throwError(() => err);
        })
      );
  }

  responseToFriendRequest(
    id: number,
    statusResponse: 'accepted' | 'declined'
  ): Observable<FriendRequest> {
    return this.http
      .patch<FriendRequest>(
        `${environment.baseApiUrl}/user/friend-request/response/${id}`,
        { status: statusResponse },
        this.httpOptions
      )
      .pipe(
        catchError((err) => {
          console.error(err);
          return throwError(() => err);
        })
      );
  }

  respondToFriendRequest(
    id: number,
    statusResponse: 'accepted' | 'declined'
  ): Observable<FriendRequest> {
    return this.http.patch<FriendRequest>(
      `${environment.baseApiUrl}/user/friend-request/response/${id}`,
      { status: statusResponse },
      this.httpOptions
    );
  }
}
