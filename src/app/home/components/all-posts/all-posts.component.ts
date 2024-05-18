import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScrollCustomEvent } from '@ionic/core';
import { IonInfiniteScroll } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.interface';

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
  getSelectedPostsSub!: Subscription;
  getPostBehaviorSubjectSub!: Subscription;

  constructor(private postService: PostService) {}

  ngOnInit() {
    this.loadData(null);
    this.loadNewPost();
  }

  loadNewPost() {
    this.getPostBehaviorSubjectSub = this.postService
      .getPostBehaviorSubject()
      .subscribe({
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
        error: (err) => console.log(err),
      });
  }

  ngOnDestroy(): void {
    this.getSelectedPostsSub ? this.getSelectedPostsSub.unsubscribe() : null;
    this.getPostBehaviorSubjectSub
      ? this.getPostBehaviorSubjectSub.unsubscribe()
      : null;
  }
}
