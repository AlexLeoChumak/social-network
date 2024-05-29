import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScrollCustomEvent } from '@ionic/core';
import { IonInfiniteScroll, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.interface';
import { AuthService } from 'src/app/auth/services/auth.service';
import { UserResponse } from 'src/app/auth/models/userResponse.interface';
import { ModalComponent } from '../modal/modal.component';

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

  getSelectedPostsSub!: Subscription;
  getPostBehaviorSubjectSub!: Subscription;
  currentUserSub!: Subscription;
  deletePostSub!: Subscription;
  updatePostSub!: Subscription;

  constructor(
    private postService: PostService,
    private authService: AuthService,
    public modalController: ModalController
  ) {}

  ngOnInit() {
    this.loadData(null);
    this.loadNewPost();
    this.getCurrentUser();
  }

  getCurrentUser(): void {
    this.currentUserSub = this.authService.currentUser.subscribe({
      next: (currentUser) => {
        if (currentUser) {
          for (let post = 0; post < this.allLoadedPosts.length; post++) {
            if (this.allLoadedPosts[post].author.id === currentUser.user.id) {
              this.allLoadedPosts[post].author.imagePath =
                currentUser.user.imagePath;
            }
          }
        }

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

  async presentUpdatePostModal(postId: number, oldText: string) {
    const modal = await this.modalController.create({
      component: ModalComponent,
      cssClass: 'my-custom-class-modal-post',
      componentProps: {
        postId,
        oldText,
      },
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();

    if (!data) return;

    this.updatePostSub = this.postService.updatePost(postId, data).subscribe({
      next: () => {
        const postIndex = this.allLoadedPosts.findIndex(
          (post: Post) => post.id === postId
        );
        this.allLoadedPosts[postIndex].body = data;
      },
      error: (err) => console.error(err), //add notification for user
    });
  }

  deletePost(postId: number) {
    this.deletePostSub = this.postService.deletePost(postId).subscribe({
      next: () => {
        this.allLoadedPosts = this.allLoadedPosts.filter(
          (post) => post.id !== postId
        );
      }, //add notification for user
      error: (err) => console.error(err), //add notification for user
    });
  }

  getFullImagePath(imageName: string | undefined) {
    return this.authService.getFullImagePath(imageName);
  }

  getDefaultFullImagePath() {
    return this.authService.getDefaultFullImagePath();
  }

  ngOnDestroy(): void {
    this.getSelectedPostsSub ? this.getSelectedPostsSub.unsubscribe() : null;
    this.currentUserSub ? this.currentUserSub.unsubscribe() : null;
    this.updatePostSub ? this.updatePostSub.unsubscribe() : null;
    this.deletePostSub ? this.deletePostSub.unsubscribe() : null;
    this.getPostBehaviorSubjectSub
      ? this.getPostBehaviorSubjectSub.unsubscribe()
      : null;
  }
}
