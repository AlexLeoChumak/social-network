import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ChatService } from '../../services/chat.service';
import { NgForm } from '@angular/forms';
import { User } from 'src/app/auth/models/user.interface';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('form') form!: NgForm;
  newMessages$!: Observable<string>;
  messages: string[] = [];
  friends: User[] = [];

  getNewMessageSub!: Subscription;
  getFriendsSub!: Subscription;

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.getNewMessageSub = this.chatService
      .getNewMessage()
      .subscribe((message: string) => {
        this.messages.push(message);
      });

    this.getFriendsSub = this.chatService
      .getFriends()
      .subscribe((friends: User[]) => {
        console.log(1, friends);

        this.friends = friends;
      });
  }

  onSubmit() {
    const { message } = this.form.value;
    if (!message) return;

    this.chatService.sendMessage(message);
    this.form.reset();
  }

  ngOnDestroy(): void {
    this.getNewMessageSub ? this.getNewMessageSub.unsubscribe() : null;
    this.getFriendsSub ? this.getFriendsSub.unsubscribe() : null;
  }
}
