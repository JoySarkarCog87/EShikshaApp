import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiServices } from './api-services';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardServices {
  private httpClient = inject(HttpClient);
  private apiService = inject(ApiServices);
  

  getAdminDashboard():Observable<{result:any, message:string}>{
    return this.httpClient.get<{result:any, message:string}>(this.apiService.getFullUrl("admin/dashboard"));
  }

  getInstructorDashboard():Observable<{result:any, message:string}>{
    return this.httpClient.get<{result:any, message:string}>(this.apiService.getFullUrl("instructor/dashboard"));
  }

  getStudentDashboard():Observable<{result:any, message:string}>{
    return this.httpClient.get<{result:any, message:string}>(this.apiService.getFullUrl("student/dashboard"));
  }
}
