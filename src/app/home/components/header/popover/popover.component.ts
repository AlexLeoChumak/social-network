import { Component, OnDestroy, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { UserResponse } from 'src/app/auth/models/userResponse.interface';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
})
export class PopoverComponent implements OnInit, OnDestroy {
  user!: UserResponse | null;
  imagePath!: string;
  private userFullImagePathSub!: Subscription;
  private userBehaviorSubjectSub!: Subscription;

  constructor(
    private authService: AuthService,
    public popoverController: PopoverController
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

  onSignOut() {
    this.authService.logout();
    this.popoverController.dismiss();
  }

  ngOnDestroy(): void {
    this.userFullImagePathSub ? this.userFullImagePathSub.unsubscribe() : null;
    this.userBehaviorSubjectSub
      ? this.userBehaviorSubjectSub.unsubscribe()
      : null;
  }
}
