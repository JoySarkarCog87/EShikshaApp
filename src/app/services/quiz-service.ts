import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiServices } from './api-services';
import { Observable } from 'rxjs';
import { Quiz } from '../models/quiz';
import { QuizResponse } from '../models/quizResponse';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private httpClient = inject(HttpClient);
  private apiServices = inject(ApiServices);

  getQuizes(courseId:string):Observable<{result:any, message:string}>{
    return this.httpClient.get<{result:any, message:string}>(this.apiServices.getFullUrl(`instructor/course/${courseId}/quiz`));
  }

  getQuizById(courseId:string, quizId:string):Observable<{result:Quiz, message:string}>{
    return this.httpClient.get<{result:Quiz, message:string}>(this.apiServices.getFullUrl(`student/course/${courseId}/quiz/${quizId}`))
  }

  addQuiz(courseId:string, quizData:Quiz):Observable<{result:any, message:string}>{
    return this.httpClient.post<{result:any, message:string}>(this.apiServices.getFullUrl(`instructor/course/${courseId}/quiz`), quizData);
  }

  deleteQuiz(courseId:string, quizId:string):Observable<{result:null, message:string}>{
    return this.httpClient.delete<{result:null, message:string}>(this.apiServices.getFullUrl(`instructor/course/${courseId}/quiz/${quizId}`));
  }

  updateQuiz(courseId:string, quizId:string, updatedData:any):Observable<{result:Quiz, message:string}>{
    return this.httpClient.patch<{result:Quiz, message:string}>(this.apiServices.getFullUrl(`instructor/course/${courseId}/quiz/${quizId}`), updatedData);
  }

  submitQuizResponse(courseId:string, quizId:string, quizData:QuizResponse):Observable<{result:QuizResponse, message:string}>{
    return this.httpClient.post<{result:QuizResponse, message:string}>(this.apiServices.getFullUrl(`student/course/${courseId}/quiz/${quizId}`), quizData);
  }
}
