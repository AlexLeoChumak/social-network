import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScrollCustomEvent } from '@ionic/core';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.interface';
// import { IonInfiniteScroll } from '@ionic/angular';

@Component({
  selector: 'app-all-posts',
  templateUrl: './all-posts.component.html',
  styleUrls: ['./all-posts.component.scss'],
})
export class AllPostsComponent implements OnInit {
  // @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;

  queryParams: string = '';
  allLoadedPosts: Post[] = [];
  numberOfPosts: number = 5;
  skipPosts: number = 0;

  constructor(private postService: PostService) {}

  ngOnInit() {
    this.loadData(null);
  }

  loadData(event: IonInfiniteScrollCustomEvent<void> | null): void {
    this.queryParams = `?take=${this.numberOfPosts}&skip=${this.skipPosts}`;

    this.postService.getSelectedPosts(this.queryParams).subscribe({
      next: (posts: Post[]) => {
        if (posts.length === 0 || posts.length < this.numberOfPosts) {
          event ? (event.target.disabled = true) : null;
          event ? event.target.complete() : null;
          return;
        }

        for (let post = 0; post < posts.length; post++) {
          this.allLoadedPosts.push(posts[post]);
        }

        this.skipPosts += this.numberOfPosts;

        event ? event.target.complete() : null;
      },
      error: (err) => console.log(err),
    });
  }
}
