import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiServices } from './api-services';
import { Observable } from 'rxjs';

type announcementType = {
  message:string,
  course:{
    title:string,
    category:string
  },
  createdAt:Date,
  instructor?:{
    name?:string
  }
}

@Injectable({
  providedIn: 'root',
})
export class AnnouncementService {
  httpClient = inject(HttpClient);
  apiService = inject(ApiServices);

  loadInstructorAnnouncements(courseId:string):Observable<{result:announcementType[], message:string}>{
    return this.httpClient.get<{result:announcementType[], message:string}>(this.apiService.getFullUrl(`instructor/course/${courseId}/announcement`));
  }

  loadStudentAnnouncements():Observable<{result:announcementType[], message:string}>{
    return this.httpClient.get<{result:announcementType[], message:string}>(this.apiService.getFullUrl('student/announcements'));
  }

  postAnnouncement(courseId:string, formData:any):Observable<{result:announcementType, message:string}>{
    return this.httpClient.post<{result:announcementType, message:string}>(this.apiService.getFullUrl(`instructor/course/${courseId}/announcement`), formData);
  }

}
