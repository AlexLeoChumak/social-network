import { Component, OnDestroy, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { PopoverComponent } from './popover/popover.component';
import { UserResponse } from 'src/app/auth/models/userResponse.interface';
import { AuthService } from 'src/app/auth/services/auth.service';
import { FriendRequestsPopoverComponent } from './friend-requests-popover/friend-requests-popover.component';
import { FriendRequest } from '../../models/friend-request.interface';
import { ConnectionProfileService } from '../../services/connection-profile.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  user!: UserResponse | null;
  imagePath!: string;
  friendRequests!: FriendRequest[];

  private userFullImagePathSub!: Subscription;
  private userBehaviorSubjectSub!: Subscription;
  private friendRequestsSub!: Subscription;

  constructor(
    public popoverController: PopoverController,
    public connectionProfileService: ConnectionProfileService,
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

    this.friendRequestsSub = this.connectionProfileService
      .getFriendRequest()
      .subscribe((friendRequest: FriendRequest[]) => {
        this.connectionProfileService.friendRequests = friendRequest.filter(
          (friendRequest: FriendRequest) => friendRequest.status === 'pending'
        );
      });
  }

  async presentPopover(e: Event) {
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      event: e,
      showBackdrop: false,
      cssClass: 'my-custom-class',
    });

    await popover.present();

    const { role } = await popover.onDidDismiss();
    console.log(`Popover dismissed with role: ${role}`);
  }

  async presentFriendRequestPopover(e: Event) {
    const popover = await this.popoverController.create({
      component: FriendRequestsPopoverComponent,
      event: e,
      showBackdrop: false,
      cssClass: 'my-custom-class',
    });

    await popover.present();

    const { role } = await popover.onDidDismiss();
    console.log(`Friend requests popover dismissed with role: ${role}`);
  }

  ngOnDestroy(): void {
    this.userFullImagePathSub ? this.userFullImagePathSub.unsubscribe() : null;
    this.userBehaviorSubjectSub
      ? this.userBehaviorSubjectSub.unsubscribe()
      : null;
    this.friendRequestsSub ? this.friendRequestsSub.unsubscribe() : null;
  }
}
