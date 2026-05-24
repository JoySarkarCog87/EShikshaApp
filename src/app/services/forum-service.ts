import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiServices } from './api-services';
import { Observable } from 'rxjs';
  
type forumType={
  users:string,
  titlt:string,
  description:string
 replies:{
  users:string,
  reply:string,
  date:Date
 }
}
@Injectable({
  providedIn: 'root',
})
export class ForumService {
  httpClient = inject(HttpClient);
  apiService = inject(ApiServices);
   
  loadForumPosts() {
    return this.httpClient.get<{result:forumType[],message:string}>(this.apiService.getFullUrl('api/forum'));
  }
  creatForumPosts(newEntry:any):Observable<{result:any, message:string}>{
    return this.httpClient.post<{result:forumType[], message:string}>(this.apiService.getFullUrl('api/forum'),newEntry);
  }
  createForumReply(postId:string,replyData:any):Observable<{result:any,message:string}>{
    return this.httpClient.post<{result:forumType[],message:string}>(this.apiService.getFullUrl(`api/forum/${postId}/reply`),replyData);
  }

}
