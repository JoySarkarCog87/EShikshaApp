import { Component, inject, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CourseCard } from '../course-card/course-card';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../services/course-service';
import { Course } from '../../models/course';
import { debounce, debounceTime } from 'rxjs';
import { LoadingService } from '../../services/loading-service';

@Component({
  selector: 'app-landing',
  imports: [ReactiveFormsModule, RouterModule, CourseCard, CommonModule],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {

  courseServices = inject(CourseService);
  loadingService = inject(LoadingService);

  searchCourse = new FormControl('');
  //courses came from api
  courses = signal<Course[]|null>(null);


  ngOnInit(){
    this.loadingService.isLoading$.next(true);
    
    this.courseServices.getAllCourses().subscribe(res=>{
      this.courses.set(res.result);
      this.loadingService.isLoading$.next(false);
    })
    
    this.searchCourse.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(res=>{
      this.loadingService.isLoading$.next(true);
      console.log(res);
        this.courseServices.getAllCourses(res??'').subscribe(response=>{
        this.courses.set(response.result);
        this.loadingService.isLoading$.next(false);
      })
    })
  }
  
  // Partnars came form api
  partnars = ["Google", "Amazon", "Flipkart"];

}
