import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiServices } from './api-services';
import { Course } from '../models/course';
import { BehaviorSubject, combineLatest, firstValueFrom, map, Observable } from 'rxjs';
import { Assignments } from '../models/assignments';
import { EnrolledCourse } from '../models/enrolledCourse';
import { UserService } from './user-service';

@Injectable({
  providedIn: 'root',
})
export class CourseService {

  httpClient = inject(HttpClient);
  apiServices = inject(ApiServices);
  userService = inject(UserService);

  instructorCourses$ = new BehaviorSubject<Course[]|null>(null);
  instructorCoursesList$ = new BehaviorSubject<{id:string, title:string, category:string}[]|null>(null);
  studentCourses$=new BehaviorSubject<EnrolledCourse[]|null>(null);

  catalogCourses$ = new BehaviorSubject<Course[]>([]);

  getAllCourses(title?:string,instructor?:string):Observable<{result:Course[],message:string}>{
    let params = new HttpParams();
    if(title && title.length>0){
      params = params.set("title",title);
    }
    if(instructor){
      params=params.set("instructor",instructor);
    }
    return this.httpClient.get<{result:Course[],message:string}>(this.apiServices.getFullUrl('course'), {params});
  }

  getCourseById(courseId:string, studentId?:string):Observable<{result:{course:Course,assignments:Assignments[], quizzes:any[], totalEnrollments:number, isEnrolled:boolean}, message:string}>{
    let params = new HttpParams();
    if(studentId){
      params = params.set("studentId", studentId);
    }
    return this.httpClient.get<{result:{course:Course,assignments:Assignments[], quizzes:any[], totalEnrollments:number, isEnrolled:boolean}, message:string}>(this.apiServices.getFullUrl(`course/${courseId}`), {params})
  }

  createCourse(course:Course):Observable<{result:Course, message:string}>{
    return this.httpClient.post<{result:Course, message:string}>(this.apiServices.getFullUrl("instructor/course"),course);
  }
  updateCourse(courseId:string,updatedData:Course):Observable<{result:Course, message:string}>{
    return this.httpClient.patch<{result:Course, message:string}>(this.apiServices.getFullUrl(`instructor/course/${courseId}`),updatedData);
  }
  
  deleteCourse(courseId:string):Observable<{result:null; message: string }>{
    return this.httpClient.delete<{result:null ; message: string }>(this.apiServices.getFullUrl(`instructor/course/${courseId}`));
}
  

//ENROLLMENT============

  enrollCourse(courseId:string):Observable<{result:EnrolledCourse, message:string}>{
    return this.httpClient.post<{result:EnrolledCourse, message:string}>(this.apiServices.getFullUrl(`student/course/${courseId}/enroll`),{});
  }

  getEnrolledCourse():Observable<{result:EnrolledCourse[],message:string}>{
    return this.httpClient.get<{result:EnrolledCourse[],message:string}>(this.apiServices.getFullUrl(`student/course`));
  }

  getStudentsCourseReport(courseId:string):Observable<{result:null, message:string}>{
    return this.httpClient.get<{result:null, message:string}>(this.apiServices.getFullUrl(`instructor/course/${courseId}/report`))
  }

  deleteEnrollment(courseId:string):Observable<{result:null,message:string}>{
    return this.httpClient.delete<{result:null,message:string}>(this.apiServices.getFullUrl(`student/course/${courseId}/enroll`))
  }


  submitRating(courseId:string, data:any):Observable<{result:{feedback:any[]}, message:string}>{
    return this.httpClient.post<{result:{feedback:any[]}, message:string}>(this.apiServices.getFullUrl(`student/course/${courseId}/review`), data);
  }
}
