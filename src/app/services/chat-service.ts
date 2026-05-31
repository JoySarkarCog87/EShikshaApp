import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatData } from '../models/chatModel';
import { ApiServices } from './api-services';
import { UserService } from './user-service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  httpClient = inject(HttpClient);
  apiServices = inject(ApiServices);
  userService = inject(UserService);

  getChatResponse(chats:ChatData[]):Observable<{result:string}>{
    return this.httpClient.post<{result:string}>(this.apiServices.getFullUrl('user/chat'), {message: chats});
  }

  checBotStatus():Observable<{result:string, message:string}>{
    return this.httpClient.get<{result:string, message:string}>(this.apiServices.getFullUrl('user/chat'));
  }
}
