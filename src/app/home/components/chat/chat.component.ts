import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatService } from '../../services/chat.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('form') form!: NgForm;
  newMessages$!: Observable<string>;
  messages: string[] = [];

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    return this.chatService.getNewMessage().subscribe((message: string) => {
      this.messages.push(message);
    });
  }

  onSubmit() {
    const { message } = this.form.value;
    if (!message) return;

    this.chatService.sendMessage(message);
    this.form.reset();
  }

  ngOnDestroy(): void {}
}
