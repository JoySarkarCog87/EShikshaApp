import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthUser } from '../models/authUser';
import { User } from '../models/user';
import { ApiServices } from './api-services';

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

  getUsers(role?:string,searchVal?:string, pageNumber?:number):Observable<{result:{users:User[], totalUsers:number}, message:string}>{
    let params = new HttpParams();

    if (role && role !== 'ALL') params = params.append('role', role);
    if (searchVal && searchVal.trim() !== '') params = params.append('searchVal', searchVal);
    if(pageNumber) params = params.append('pageNumber', pageNumber)
    return this.httpClient.get<{result:{users:User[], totalUsers:number}, message:string}>(this.apiServices.getFullUrl(`admin/users`),{params})
  }

  updateUser(userId:string, role?:string):Observable<{result:null, message:string}>{
    return this.httpClient.patch<{result:null, message:string}>(this.apiServices.getFullUrl(`admin/user/${userId}`), {role});
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

  addInstructor(userData:{name:string, email:string}):Observable<{result:User, message:string}>{
    return this.httpClient.post<{result:User, message:string}>(this.apiServices.getFullUrl('admin/user'), userData);
  }
}
