import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Role } from 'src/app/auth/models/user.interface';
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

  userFullImagePath!: string;
  form!: FormGroup;
  private userRoleSub!: Subscription;
  private uploadUserImageSub!: Subscription;
  private userFullImagePathSub!: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.form = new FormGroup({
      file: new FormControl(null),
    });

    this.userRoleSub = this.authService.userRole.subscribe(
      (role: Role | null) => {
        role ? (this.bannerColors = this.getBannerColors(role)) : null;
      }
    );

    this.userFullImagePathSub = this.authService.userFullImagePath.subscribe(
      (fullImagePath: string) => {
        this.userFullImagePath = fullImagePath;
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
    this.userRoleSub ? this.userRoleSub.unsubscribe() : null;
    this.uploadUserImageSub ? this.uploadUserImageSub.unsubscribe() : null;
    this.userFullImagePathSub ? this.userFullImagePathSub.unsubscribe() : null;
  }
}
