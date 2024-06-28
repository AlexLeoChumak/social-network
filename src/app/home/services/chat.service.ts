import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { User } from 'src/app/auth/models/user.interface';
import { ChatSocketService } from 'src/app/core/chat-socket.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(
    private chatSocketService: ChatSocketService,
    private http: HttpClient
  ) {}

  sendMessage(message: string): void {
    this.chatSocketService.emit('sendMessage', message);
  }

  getNewMessage(): Observable<string> {
    return this.chatSocketService.fromEvent<string>('newMessage');
  }

  getFriends(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.baseApiUrl}/user/friends/my`);
  }
}
