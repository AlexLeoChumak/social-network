import { Component, OnDestroy, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Subscription, from, mergeMap, of, tap } from 'rxjs';

import { User } from 'src/app/auth/models/user.interface';
import { FriendRequest } from 'src/app/home/models/friend-request.interface';
import { ConnectionProfileService } from 'src/app/home/services/connection-profile.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-friend-requests-popover',
  templateUrl: './friend-requests-popover.component.html',
  styleUrls: ['./friend-requests-popover.component.scss'],
})
export class FriendRequestsPopoverComponent implements OnInit, OnDestroy {
  friendRequests: FriendRequest[] = [];
  friendRequestsTemporaryArray: FriendRequest[] = [];

  private getFriendRequestSub!: Subscription;
  private respondToFriendRequestSub!: Subscription;

  constructor(
    public connectionProfileService: ConnectionProfileService,
    private popoverController: PopoverController
  ) {}

  ngOnInit() {
    this.getFriendRequestWithRenderingUsersInPopover();

    this.connectionProfileService.friendRequests.subscribe(
      (friendRequests: FriendRequest[]) => {
        this.friendRequests = friendRequests;
      }
    );
  }

  getFriendRequestWithRenderingUsersInPopover(): void {
    this.getFriendRequestSub = this.connectionProfileService
      .getFriendRequest()
      .pipe(
        mergeMap((requests: FriendRequest[]) => from(requests)), // Преобразуем массив запросов в последовательные эмиссии
        mergeMap((request: FriendRequest) => {
          const creatorId = (request as any)?.creator?.id;

          if (creatorId && request.status === 'pending') {
            return this.connectionProfileService
              .getConnectionUser(creatorId)
              .pipe(
                tap((user: User) => {
                  request['fullImagePath'] = `${
                    environment.baseApiUrl
                  }/feed/image/${user.imagePath || 'default-user-image.jpg'}`;

                  this.friendRequestsTemporaryArray.push(request);
                })
              );
          } else {
            return of(null); // Возвращаем пустой Observable, если нет creatorId
          }
        })
      )
      .subscribe({
        complete: () => {
          this.connectionProfileService.setFriendRequests(
            this.friendRequestsTemporaryArray
          );
        },
      });
  }

  //принять или отклонить запрос в друзья
  async respondToFriendRequest(
    id: number,
    statusResponse: 'accepted' | 'declined'
  ) {
    const handledFriendRequest: FriendRequest | undefined =
      this.friendRequests.find((friendRequest) => friendRequest.id === id);

    const unhandledFriendRequests: FriendRequest[] = this.friendRequests.filter(
      (friendRequest) => friendRequest.id !== handledFriendRequest?.id
    );

    this.friendRequests = unhandledFriendRequests;
    this.connectionProfileService.setFriendRequests(this.friendRequests);

    if (this.friendRequests.length === 0) {
      await this.popoverController.dismiss();
    }

    this.respondToFriendRequestSub = this.connectionProfileService
      .respondToFriendRequest(id, statusResponse)
      .subscribe();
  }

  ngOnDestroy(): void {
    this.getFriendRequestSub ? this.getFriendRequestSub.unsubscribe() : null;
    this.respondToFriendRequestSub
      ? this.respondToFriendRequestSub.unsubscribe()
      : null;
  }
}
