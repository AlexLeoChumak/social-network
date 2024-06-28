import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';

import { ChatService } from '../../services/chat.service';
import { User } from 'src/app/auth/models/user.interface';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('form') form!: NgForm;
  userFullImagePath!: string;
  newMessages$!: Observable<string>;
  messages: string[] = [];
  friends: User[] = [];
  friend!: User;
  friend$: BehaviorSubject<User | {}> = new BehaviorSubject<User | {}>({});
  selectedConversationIndex: number = 0;

  private getNewMessageSub!: Subscription;
  private getFriendsSub!: Subscription;
  private userFullImagePathSub!: Subscription;

  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.getNewMessageSub = this.chatService
      .getNewMessage()
      .subscribe((message: string) => {
        this.messages.push(message);
      });

    this.getFriendsSub = this.chatService
      .getFriends()
      .subscribe((friends: User[]) => {
        this.friends = friends;
      });

    this.userFullImagePathSub = this.authService.userFullImagePath.subscribe(
      (fullImagePath: string) => {
        this.userFullImagePath = fullImagePath;
      }
    );
  }

  onSubmit() {
    const { message } = this.form.value;
    if (!message) return;

    this.chatService.sendMessage(message);
    this.form.reset();
  }

  openConversation(friend: User, index: number): void {
    this.selectedConversationIndex = index;
    this.friend = friend;
    this.friend$.next(this.friend);
  }

  ngOnDestroy(): void {
    this.getNewMessageSub ? this.getNewMessageSub.unsubscribe() : null;
    this.getFriendsSub ? this.getFriendsSub.unsubscribe() : null;
    this.userFullImagePathSub ? this.userFullImagePathSub.unsubscribe() : null;
  }
}
