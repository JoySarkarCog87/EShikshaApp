import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUser } from '../models/authUser';
import { ApiServices } from './api-services';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private httpClient = inject(HttpClient);
  private apiServices = inject(ApiServices);
  activeUser$ = new BehaviorSubject<User|null>(null);
  
  login(user:AuthUser):Observable<{result:{token:string}, message:string}>{
    return this.httpClient.post<{result:{token:string}, message:string}>(this.apiServices.getFullUrl("auth/login"), user);
  }

  logout():Observable<{result:{token:string},message:string}>{
      return this.httpClient.post<{result:{token:string},message:string}>(this.apiServices.getFullUrl("user/logout"), {});
  }

  register(user:User):Observable<{result:any, message:string|string[]}>{
    return this.httpClient.post<{result:any, message:string|string[]}>(this.apiServices.getFullUrl("auth/register"), user);
  }

  getUsers(role?:string,searchVal?:string):Observable<{result:User[], success:boolean, message:string, errors:any[]}>{
    let params = new HttpParams();
    // Only append if the value actually exists
    if (role && role !== 'ALL') params = params.append('role', role);
    if (searchVal && searchVal.trim() !== '') params = params.append('searchVal', searchVal);
    return this.httpClient.get<{result:User[], success:boolean, message:string, errors:any[]}>(this.apiServices.getFullUrl(`admin/users`),{params})
  }

  updateUser(userId:string, updatedData:{email?:string,name?:string}):Observable<{result:null, message:string}>{
    return this.httpClient.patch<{result:null, message:string}>(this.apiServices.getFullUrl(`admin/user/${userId}`), updatedData);
  }

  deleteUser(userId:string):Observable<{result:null, message:string}>{
    return this.httpClient.delete<{result:null, message:string}>(this.apiServices.getFullUrl(`admin/user/${userId}`));
  }

  updateUserSettings(updatedSettings?:{email?:string,name?:string,password?:string}):Observable<{result:any, message:string}>{
    if(!updatedSettings){
      throw "Please provide some value to update";
    }
    return this.httpClient.patch<{result:any, message:string}>(this.apiServices.getFullUrl("user/settings"), updatedSettings);
  }

  getUserSettings():Observable<{result:User, message:string}>{
    return this.httpClient.get<{result:User, message:string}>(this.apiServices.getFullUrl("user/settings"));
  }
}
