import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { debounceTime, finalize, startWith } from 'rxjs';
import { Course } from '../../models/course';
import { CourseService } from '../../services/course-service';
import { LoadingService } from '../../services/loading-service';
import { CourseCard } from '../course-card/course-card';

@Component({
  selector: 'app-course-catalog',
  imports: [RouterModule, CourseCard, ReactiveFormsModule],
  templateUrl: './course-catalog.html',
  styleUrl: './course-catalog.css',
})
export class CourseCatalog {
  private courseService = inject(CourseService);
  private loadingService = inject(LoadingService);


  courseList = signal<Course[]>([]);
  searchQuery = new FormControl('');

  ngOnInit(){
    this.searchQuery.valueChanges
    .pipe(
      debounceTime(400),
      startWith("")
    )
    .subscribe(svalue=>{
      this.getCourses(svalue??"");
    })
  }


  getCourses = (val?:string)=>{
    this.loadingService.isLoading$.next(true)
    this.courseService.getAllCourses(1,val)
    .pipe(
      finalize(()=>this.loadingService.isLoading$.next(false))
    )
    .subscribe(res=>{
      this.courseList.set(res.result.courses);
    })
  }


}
