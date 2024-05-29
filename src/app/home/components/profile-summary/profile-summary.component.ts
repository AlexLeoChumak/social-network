import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Role } from 'src/app/auth/models/user.interface';
import { UserResponse } from 'src/app/auth/models/userResponse.interface';
import { AuthService } from 'src/app/auth/services/auth.service';

type ValidFileExtension = 'png' | 'jpg' | 'jpeg';
type ValidMimeType = 'image/png' | 'image/jpg' | 'image/jpeg';

type BannerColors = {
  colorOne: string;
  colorTwo: string;
  colorThree: string;
};

@Component({
  selector: 'app-profile-summary',
  templateUrl: './profile-summary.component.html',
  styleUrls: ['./profile-summary.component.scss'],
})
export class ProfileSummaryComponent implements OnInit, OnDestroy {
  bannerColors: BannerColors = {
    colorOne: '#a0b4b7',
    colorTwo: '#dbe7e9',
    colorThree: '#bfd3d6',
  };

  validFileExtensions: ValidFileExtension[] = ['png', 'jpg', 'jpeg'];
  validMimeTypes: ValidMimeType[] = ['image/png', 'image/jpg', 'image/jpeg'];

  user!: UserResponse | null;
  userFullImagePath!: string;
  form!: FormGroup;
  private uploadUserImageSub!: Subscription;
  private userFullImagePathSub!: Subscription;
  private userBehaviorSubjectSub!: Subscription;

  constructor(private authService: AuthService) {}

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
          ? (this.bannerColors = this.getBannerColors(user.user.role))
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

  private getBannerColors(role: Role): BannerColors {
    switch (role) {
      case 'admin':
        return {
          colorOne: '#daa520',
          colorTwo: '#f0e68c',
          colorThree: '#fafad2',
        };
      case 'premium':
        return {
          colorOne: '#bc8f8f',
          colorTwo: '#c09999',
          colorThree: '#ddadaf',
        };

      default:
        return this.bannerColors;
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
