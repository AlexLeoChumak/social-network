import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable, Subscription, map, switchMap } from 'rxjs';

import { BannerColorService } from '../../services/banner-color.service';
import { ConnectionProfileService } from '../../services/connection-profile.service';
import { User } from 'src/app/auth/models/user.interface';
import {
  FriendRequestStatus,
  FriendRequestStatusType,
} from '../../models/friend-request.interface';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-connection-profile',
  templateUrl: './connection-profile.component.html',
  styleUrls: ['./connection-profile.component.scss'],
})
export class ConnectionProfileComponent implements OnInit, OnDestroy {
  user!: User;
  friendRequestStatus!: FriendRequestStatusType;
  friendRequestStatusSub!: Subscription;
  userSub!: Subscription;
  addConnectionUserSub!: Subscription;

  constructor(
    public bannerColorService: BannerColorService,
    private connectionProfileService: ConnectionProfileService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.friendRequestStatusSub = this.getFriendRequestStatus().subscribe({
      next: (friendRequestStatus: FriendRequestStatus) =>
        (this.friendRequestStatus = friendRequestStatus.status),
    });

    this.userSub = this.getUser().subscribe((user: User) => {
      this.user = user;
      const imgPath = user.imagePath ?? 'default-user-image.jpg';
      this.user[
        'fullImagePath'
      ] = `${environment.baseApiUrl}/feed/image/${imgPath}`;
    });
  }

  getUser(): Observable<User> {
    return this.getUserIdFromUrl().pipe(
      switchMap((userId: number) => {
        return this.connectionProfileService.getConnectionUser(userId);
      })
    );
  }

  addConnectionUser(): void {
    this.friendRequestStatus = 'pending';

    this.addConnectionUserSub = this.getUserIdFromUrl()
      .pipe(
        switchMap((userId: number) => {
          return this.connectionProfileService.addConnectionUser(userId);
        })
      )
      .subscribe();
  }

  getFriendRequestStatus(): Observable<FriendRequestStatus> {
    return this.getUserIdFromUrl().pipe(
      switchMap((userId: number) => {
        return this.connectionProfileService.getFriendRequestStatus(userId);
      })
    );
  }

  private getUserIdFromUrl(): Observable<number> {
    return this.route.params.pipe(map((params: Params) => +params['id']));
  }

  ngOnDestroy(): void {
    this.userSub ? this.userSub.unsubscribe() : null;
    this.addConnectionUserSub ? this.addConnectionUserSub.unsubscribe() : null;
    this.friendRequestStatusSub
      ? this.friendRequestStatusSub.unsubscribe()
      : null;
  }
}
