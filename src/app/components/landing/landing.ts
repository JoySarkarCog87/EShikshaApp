import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, finalize, startWith, switchMap } from 'rxjs';
import { Course } from '../../models/course';
import { CourseService } from '../../services/course-service';
import { LoadingService } from '../../services/loading-service';
import { CourseCard } from '../course-card/course-card';

@Component({
  selector: 'app-landing',
  imports: [ReactiveFormsModule, RouterModule, CourseCard, CommonModule],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {

  private courseServices = inject(CourseService);
  private loadingService = inject(LoadingService);
  private toastService = inject(ToastrService);

  searchCourse = new FormControl('');
  courses = signal<Course[]|null>(null);


  ngOnInit(){
    this.loadingService.isLoading$.next(true);
    
    this.searchCourse.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      startWith(""),
      switchMap((res)=>{
        return this.courseServices.getAllCourses(1,res??'').pipe(
          finalize(()=>this.loadingService.isLoading$.next(false))
        )
      })
    )
    .subscribe({
      next:response=>{
        this.courses.set(response.result.courses);
      },
      error:err=>{
        this.toastService.error(err?.error?.message??"Error while searching course");
      }
    })
  }
  

  partnars = ["Google", "Amazon", "Flipkart"];

}
