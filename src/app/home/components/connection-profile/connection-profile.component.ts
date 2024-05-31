import { Component, OnInit } from '@angular/core';
import { BannerColorService } from '../../services/banner-color.service';
import { ConnectionProfileService } from '../../services/connection-profile.service';
import { ActivatedRoute, Params, UrlSegment } from '@angular/router';
import { Observable, map, switchMap } from 'rxjs';
import { User } from 'src/app/auth/models/user.interface';

@Component({
  selector: 'app-connection-profile',
  templateUrl: './connection-profile.component.html',
  styleUrls: ['./connection-profile.component.scss'],
})
export class ConnectionProfileComponent implements OnInit {
  constructor(
    public bannerColorService: BannerColorService,
    private connectionProfileService: ConnectionProfileService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.getUser().subscribe((q) => console.log(q));
  }

  getUser(): Observable<User> {
    return this.getUserIdFromUrl().pipe(
      switchMap((userId: number) => {
        return this.connectionProfileService.getConnectionUser(userId);
      })
    );
  }

  private getUserIdFromUrl(): Observable<number> {
    return this.route.params.pipe(map((params: Params) => +params['id']));
  }
}
