import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable, Subscription, map, of, switchMap, tap } from 'rxjs';

import { BannerColorService } from '../../services/banner-color.service';
import { ConnectionProfileService } from '../../services/connection-profile.service';
import { User } from 'src/app/auth/models/user.interface';
import {
  FriendRequest,
  FriendRequestStatus,
  FriendRequestStatusType,
} from '../../models/friend-request.interface';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/auth/services/auth.service';
import { UserResponse } from 'src/app/auth/models/userResponse.interface';

@Component({
  selector: 'app-connection-profile',
  templateUrl: './connection-profile.component.html',
  styleUrls: ['./connection-profile.component.scss'],
})
export class ConnectionProfileComponent implements OnInit, OnDestroy {
  user!: User;
  authorizedUserId!: number;
  userIdFromUrlParams!: number;
  friendRequestStatus!: FriendRequestStatusType;
  friendRequests: FriendRequest[] = [];

  userSub!: Subscription;
  addConnectionUserSub!: Subscription;
  friendRequestStatusSub!: Subscription;
  getUserIdFromUrlSub!: Subscription;
  currentUserSub!: Subscription;
  respondToFriendRequestSub!: Subscription;

  constructor(
    public bannerColorService: BannerColorService,
    private connectionProfileService: ConnectionProfileService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.connectionProfileService.friendRequests.subscribe(
      (friendRequests: FriendRequest[]) => {
        console.log(friendRequests);
        this.friendRequests = friendRequests;
      }
    );

    this.friendRequestStatusSub = this.getFriendRequestStatus().pipe(
      tap((status: FriendRequestStatus) => {
        this.connectionProfileService.setFriendRequestStatus(status.status)
      }),
      switchMap((status: FriendRequestStatus) => {
        return this.connectionProfileService.friendRequestStatus
      })
    ).subscribe((status: FriendRequestStatusType) => {
      this.friendRequestStatus = status
    })

    this.userSub = this.getUser().subscribe((user: User) => {
      this.user = user;
      const imgPath = user.imagePath ?? 'default-user-image.jpg';
      this.user[
        'fullImagePath'
      ] = `${environment.baseApiUrl}/feed/image/${imgPath}`;
    });


    this.getUserIdFromUrlSub = this.getUserIdFromUrl().subscribe(
      (userId: number) => {
        this.userIdFromUrlParams = userId;
      }
    );

    this.currentUserSub = this.authService.currentUser.subscribe(
      (authorizedUser: UserResponse | null) => {
        if (authorizedUser) {
          this.authorizedUserId = authorizedUser.user.id;
        }
      }
    );
  }

  getUser(): Observable<User> {
    return this.getUserIdFromUrl().pipe(
      switchMap((userId: number) => {
        return this.connectionProfileService.getConnectionUser(userId);
      })
    );
  }

  //adding as a friend
  //добавление в друзья
  addConnectionUser(): void {
    this.friendRequestStatus = 'pending';

    this.addConnectionUserSub = this.getUserIdFromUrl()
      .pipe(
        switchMap((userId: number) => {
          return this.connectionProfileService.addConnectionUser(userId);
        })
      )
      .subscribe({
        next: (responce) => {
          if ('error' in responce) {
            if (responce.error.includes('It is not possible to add yourself')) {
              console.log(1, 'It is not possible to add yourself');
            }
            if (
              responce.error.includes(
                'A friend request has already been sent of received to your account!'
              )
            ) {
              console.log(
                2,
                'A friend request has already been sent of received to your account!'
              );
            }
          } else {
            console.log(3, 'Saving successfully!');
          }
        },
      });
  }

  //принять или отклонить запрос в друзья
  respondToFriendRequest(statusResponse: 'accepted' | 'declined') {

    this.friendRequestStatus = statusResponse === 'accepted' ? 'accepted' : 'declined'

    this.respondToFriendRequestSub = this.getUserIdFromUrl()
      .pipe(
        switchMap((userIdFromUrl: number) => {
          const request = this.friendRequests.find(
            (request: FriendRequest) =>
              (request as any).creator.id === userIdFromUrl
          );

          const friendRequests: FriendRequest[] = this.friendRequests.filter((friendRequest) => friendRequest.id !== request?.id)
          this.connectionProfileService.setFriendRequests(friendRequests)
          
          return of(request?.id as number);
        }),
        switchMap((requestId: number) => {
          return this.connectionProfileService.respondToFriendRequest(
            requestId,
            statusResponse
          );
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
    this.currentUserSub ? this.currentUserSub.unsubscribe() : null;
    this.getUserIdFromUrlSub ? this.getUserIdFromUrlSub.unsubscribe() : null;
    this.addConnectionUserSub ? this.addConnectionUserSub.unsubscribe() : null;
    this.respondToFriendRequestSub
      ? this.respondToFriendRequestSub.unsubscribe()
      : null;
    this.friendRequestStatusSub
      ? this.friendRequestStatusSub.unsubscribe()
      : null;
  }
}
