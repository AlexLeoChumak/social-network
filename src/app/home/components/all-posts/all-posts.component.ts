import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScrollCustomEvent } from '@ionic/core';
import { IonInfiniteScroll } from '@ionic/angular';
import { Subscription, async, filter, tap } from 'rxjs';

import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.interface';
import { AuthService } from 'src/app/auth/services/auth.service';
import { UserResponse } from 'src/app/auth/models/userResponse.interface';

@Component({
  selector: 'app-all-posts',
  templateUrl: './all-posts.component.html',
  styleUrls: ['./all-posts.component.scss'],
})
export class AllPostsComponent implements OnInit, OnDestroy {
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;

  queryParams: string = '';
  allLoadedPosts: Post[] = [];
  numberOfPosts: number = 5;
  skipPosts: number = 0;
  currentUser!: UserResponse | null;
  user: any;

  getSelectedPostsSub!: Subscription;
  getPostBehaviorSubjectSub!: Subscription;
  currentUserSub!: Subscription;
  deletePostSub!: Subscription;

  constructor(
    private postService: PostService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadData(null);
    this.loadNewPost();
    this.getCurrentUser();
    // this.reloadData();
  }

  // reloadData() {
  //   this.router.events
  //     .pipe(
  //       filter(
  //         (event): event is NavigationEnd => event instanceof NavigationEnd
  //       )
  //     )
  //     .subscribe((event: NavigationEnd) => {
  //       if (event.urlAfterRedirects === '/home') {
  //         this.loadData(null);
  //       }
  //     });
  // }

  getCurrentUser(): void {
    this.currentUserSub = this.authService.currentUser.subscribe({
      next: (currentUser) => {
        this.currentUser = currentUser;
      },
      error: (err) => console.error(err), //add notification for user
    });
  }

  loadNewPost() {
    this.getPostBehaviorSubjectSub =
      this.postService.postBehaviorSubject.subscribe({
        next: (newPost) =>
          newPost ? this.allLoadedPosts.unshift(newPost) : null,
        error: (err) => console.error(err), //add notification for user
      });
  }

  loadData(event: IonInfiniteScrollCustomEvent<void> | null): void {
    this.queryParams = `?take=${this.numberOfPosts}&skip=${this.skipPosts}`;

    this.getSelectedPostsSub = this.postService
      .getSelectedPosts(this.queryParams)
      .subscribe({
        next: (posts: Post[]) => {
          for (let post = 0; post < posts.length; post++) {
            this.allLoadedPosts.push(posts[post]);
          }

          if (posts.length === 0 || posts.length < this.numberOfPosts) {
            event ? (event.target.disabled = true) : null;
            event ? event.target.complete() : null;
            return;
          }

          this.skipPosts += this.numberOfPosts;

          event ? event.target.complete() : null;
        },
        error: (err) => console.error(err), //add notification for user
      });
  }

  presentUpdatePostModal(postId: number) {}

  deletePost(postId: number) {
    this.deletePostSub = this.postService
      .deletePost(postId)
      .pipe(
        tap(() => {
          this.allLoadedPosts = this.allLoadedPosts.filter(
            (post) => post.id !== postId
          );
        })
      )
      .subscribe({
        next: () => console.log(), //add notification for user
        error: (err) => console.error(err), //add notification for user
      });
  }

  ngOnDestroy(): void {
    this.getSelectedPostsSub ? this.getSelectedPostsSub.unsubscribe() : null;
    this.currentUserSub ? this.currentUserSub.unsubscribe() : null;
    this.deletePostSub ? this.deletePostSub.unsubscribe() : null;
    this.getPostBehaviorSubjectSub
      ? this.getPostBehaviorSubjectSub.unsubscribe()
      : null;
  }
}
