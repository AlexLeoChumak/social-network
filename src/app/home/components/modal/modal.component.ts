import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { UserResponse } from 'src/app/auth/models/userResponse.interface';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit, OnDestroy {
  @ViewChild('form') form!: NgForm;
  @Input() postId?: number;
  @Input() oldText!: string;

  user!: UserResponse | null;
  imagePath!: string;
  private userFullImagePathSub!: Subscription;
  private userBehaviorSubjectSub!: Subscription;

  constructor(
    private modalController: ModalController,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.userFullImagePathSub = this.authService.userFullImagePath.subscribe(
      (imagePath: string) => {
        this.imagePath = imagePath;
      }
    );

    this.userBehaviorSubjectSub = this.authService.currentUser.subscribe(
      (user: UserResponse | null) => {
        this.user = user;
      }
    );
  }

  onPost() {
    if (this.form.invalid) return;

    const body = this.form.value['body'];
    this.modalController.dismiss(body, 'post');
  }

  onDismiss() {
    this.modalController.dismiss(null);
  }

  ngOnDestroy(): void {
    this.userFullImagePathSub ? this.userFullImagePathSub.unsubscribe() : null;
    this.userBehaviorSubjectSub
      ? this.userBehaviorSubjectSub.unsubscribe()
      : null;
  }
}
