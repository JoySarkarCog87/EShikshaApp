import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Course } from '../models/course';
import { ApiServices } from './api-services';
import { Assignments } from '../models/assignments';
import { AssignmentsResult } from '../models/assignmentResult';

@Injectable({
  providedIn: 'root',
})
export class AssignmentService {

  httpClient = inject(HttpClient);
  apiServices = inject(ApiServices);

  selectedAssignment$ = new BehaviorSubject<Assignments | null>(null);

  instructorCourses$ = new BehaviorSubject<Course[]>([]);

  selectedResult$ = new BehaviorSubject<AssignmentsResult | null>(null);



  addAssignments(formData: FormData, courseId: string) {
    return this.httpClient.post<{ result: any, message: string }>(
      this.apiServices.getFullUrl(`instructor/course/${courseId}/assignment`),
      formData
    );
  }


  searchAssignment(courseId: string) {
    return this.httpClient.get<{ result: Assignments[], message: string }>(this.apiServices.getFullUrl(`instructor/course/${courseId}/assignment`))
  }



  deleteAssignment(id: string, courseId: string) {
    return this.httpClient.delete<{ result: Assignments[], message: string }>(this.apiServices.getFullUrl(`instructor/course/${courseId}/assignment/${id}`))
  }


  updateAssignments(formData: FormData, courseId: string, assignmentId: string) {
    return this.httpClient.patch<{ result: any, message: string }>(
      this.apiServices.getFullUrl(`instructor/course/${courseId}/assignment/${assignmentId}`),
      formData
    );
  }

  //working
  downloadAssignmentInstructor(courseId: string, fileId: string | undefined): Observable<Blob> {

    const url = this.apiServices.getFullUrl(`instructor/course/${courseId}/assignment/download/${fileId}`);
    return this.httpClient.get(url, { responseType: 'blob' });
  }

   downloadAssignmentStudent(courseId: string, fileId: string | undefined): Observable<Blob> {
    const url = this.apiServices.getFullUrl(`student/course/${courseId}/assignment/download/${fileId}`);
    return this.httpClient.get(url, { responseType: 'blob' });
  }



  uploadStudentAsignment(formData: FormData, courseId: string, assignmentId: string | undefined) {
    return this.httpClient.post<{ result: any, message: string }>(
      this.apiServices.getFullUrl(`student/course/${courseId}/assignment/${assignmentId}/result`),
      formData
    );
  }


  
  searchResult(courseId: string, assignmentId: string | undefined) {
    return this.httpClient.get<{ result: AssignmentsResult[], message: string }>(
      this.apiServices.getFullUrl(`instructor/course/${courseId}/assignment/${assignmentId}/result`)
    );
  }

  getMarks(courseId:string):Observable<{ result:{[key:string]:number}, message: string }>{
    return this.httpClient.get<{ result:{[key:string]:number}, message: string }>(
      this.apiServices.getFullUrl(`student/course/${courseId}/assignment-result`)
    );
  }

  
  giveMarks(resultId: string,courseId:string, marks: number) {
    //console.log(marks);
    return this.httpClient.patch<{ result: AssignmentsResult, message: string }>(
      this.apiServices.getFullUrl(`instructor/course/${courseId}/assignment-result/${resultId}`),
      { marks }
    );
  }


  deleteStudentSubmission(resultId: string) {
    return this.httpClient.delete<{ result: any, message: string }>(
      this.apiServices.getFullUrl(`assignment-result/${resultId}`)
    );
  }

}
