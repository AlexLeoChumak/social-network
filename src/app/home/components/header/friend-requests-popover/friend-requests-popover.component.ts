import { Component, OnDestroy, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Subscription, forkJoin, from, map, mergeMap, of, tap } from 'rxjs';

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

  private getFriendRequestSub!: Subscription;

  constructor(
    public connectionProfileService: ConnectionProfileService,
    private popoverController: PopoverController
  ) {}

  ngOnInit() {
    this.getFriendRequestWithRenderingUsersInPopover();
  }

  getFriendRequestWithRenderingUsersInPopover() {
    this.getFriendRequestSub = this.connectionProfileService
      .getFriendRequest()
      .pipe(
        mergeMap((requests: FriendRequest[]) => from(requests)), // Преобразуем массив запросов в последовательные эмиссии
        mergeMap((request: FriendRequest) => {
          const creatorId = (request as any)?.creator?.id;

          if (creatorId) {
            return this.connectionProfileService
              .getConnectionUser(creatorId)
              .pipe(
                tap((user: User) => {
                  request['fullImagePath'] = `${
                    environment.baseApiUrl
                  }/feed/image/${user.imagePath || 'default-user-image.jpg'}`;
                  this.friendRequests.push(request);
                })
              );
          } else {
            return of(null); // Возвращаем пустой Observable, если нет creatorId
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.getFriendRequestSub ? this.getFriendRequestSub.unsubscribe() : null;
  }
}
