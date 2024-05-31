import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

import { UserResponse } from 'src/app/auth/models/userResponse.interface';
import { AuthService } from 'src/app/auth/services/auth.service';
import { BannerColorService } from '../../services/banner-color.service';

type ValidFileExtension = 'png' | 'jpg' | 'jpeg';
type ValidMimeType = 'image/png' | 'image/jpg' | 'image/jpeg';

@Component({
  selector: 'app-profile-summary',
  templateUrl: './profile-summary.component.html',
  styleUrls: ['./profile-summary.component.scss'],
})
export class ProfileSummaryComponent implements OnInit, OnDestroy {
  validFileExtensions: ValidFileExtension[] = ['png', 'jpg', 'jpeg'];
  validMimeTypes: ValidMimeType[] = ['image/png', 'image/jpg', 'image/jpeg'];

  user!: UserResponse | null;
  userFullImagePath!: string;
  form!: FormGroup;
  private uploadUserImageSub!: Subscription;
  private userFullImagePathSub!: Subscription;
  private userBehaviorSubjectSub!: Subscription;

  constructor(
    private authService: AuthService,
    public bannerColorService: BannerColorService
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      file: new FormControl(null),
    });

    this.userFullImagePathSub = this.authService.userFullImagePath.subscribe(
      (fullImagePath: string) => {
        this.userFullImagePath = fullImagePath;
      }
    );

    this.userBehaviorSubjectSub = this.authService.currentUser.subscribe(
      (user: UserResponse | null) => {
        this.user = user;
        user?.user.role
          ? (this.bannerColorService.bannerColors =
              this.bannerColorService.getBannerColors(user.user.role))
          : null;
      }
    );
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    let file: File;

    if (input.files && input.files.length > 0) {
      file = input.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      this.uploadUserImageSub = this.authService
        .uploadUserImage(formData)
        .subscribe({
          next: (res) => console.log(res), // notification of successful image upload
          error: (err) => console.error(err), // image upload error notification
        });

      this.form.reset();
    }
  }

  ngOnDestroy(): void {
    this.uploadUserImageSub ? this.uploadUserImageSub.unsubscribe() : null;
    this.userFullImagePathSub ? this.userFullImagePathSub.unsubscribe() : null;
    this.userBehaviorSubjectSub
      ? this.userBehaviorSubjectSub.unsubscribe()
      : null;
  }
}
