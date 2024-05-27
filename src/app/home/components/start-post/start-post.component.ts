import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { ModalComponent } from '../modal/modal.component';
import { PostService } from '../../services/post.service';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-start-post',
  templateUrl: './start-post.component.html',
  styleUrls: ['./start-post.component.scss'],
})
export class StartPostComponent implements OnInit, OnDestroy {
  imagePath!: string;
  private createPostSub!: Subscription;
  private userFullImagePathSub!: Subscription;

  constructor(
    public modalController: ModalController,
    private postService: PostService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.userFullImagePathSub = this.authService.userFullImagePath.subscribe(
      (imagePath: string) => {
        this.imagePath = imagePath;
      }
    );
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: ModalComponent,
      cssClass: 'my-custom-class-modal-post',
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();

    if (data) {
      this.createPostSub = this.postService.createPost(data).subscribe({
        next: (post) => {
          this.postService.updatePostBehaviorSubject(post);
        },
        error: (err) => console.error(err),
      });
    }
  }

  ngOnDestroy(): void {
    this.createPostSub ? this.createPostSub.unsubscribe() : null;
    this.userFullImagePathSub ? this.userFullImagePathSub.unsubscribe() : null;
  }
}
