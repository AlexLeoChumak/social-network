import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';

import { Post } from '../models/post.interface';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ErrorHandlerService } from 'src/app/core/error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  private post$: BehaviorSubject<Post | null> =
    new BehaviorSubject<Post | null>(null);

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private errorHandlerService: ErrorHandlerService
  ) {}

  getSelectedPosts(params: string) {
    return this.http
      .get<Post[]>(`${environment.baseApiUrl}/feed/pagination${params}`)
      .pipe(
        tap((posts: Post[]) => {
          if (posts.length === 0) throw new Error('No posts to retrieve');
        }),
        catchError(
          this.errorHandlerService.handleError<Post[]>('getSelectedPosts', [])
        )
      );
  }

  // getSelectedPosts(params: string) {
  //   return this.http
  //     .get<Post[]>(`${environment.baseApiUrl}/feed/pagination${params}`)
  //     .pipe(
  //       catchError((err) => {
  //         err.error.statusCode === 401 ? this.authService.logout() : null;
  //         console.error(err);
  //         return throwError(() => err);
  //       })
  //     );
  // }

  createPost(body: string) {
    return this.http
      .post<Post>(`${environment.baseApiUrl}/feed`, { body }, this.httpOptions)
      .pipe(
        catchError((err) => {
          console.error(err);
          return throwError(() => err);
        })
      );
  }

  updatePost(postId: number, body: string) {
    return this.http
      .put(
        `${environment.baseApiUrl}/feed/${postId}`,
        { body },
        this.httpOptions
      )
      .pipe(
        catchError((err) => {
          console.error(err);
          return throwError(() => err);
        })
      );
  }

  deletePost(postId: number) {
    return this.http.delete(`${environment.baseApiUrl}/feed/${postId}`).pipe(
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      })
    );
  }

  //методы для излучения и получения нового private post$: BehaviorSubject

  updatePostBehaviorSubject(newPost: Post) {
    this.post$.next(newPost);
  }

  get postBehaviorSubject(): Observable<Post | null> {
    return this.post$.asObservable().pipe(
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      })
    );
  }
}
