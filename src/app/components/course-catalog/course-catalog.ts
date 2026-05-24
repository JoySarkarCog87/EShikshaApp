import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CourseCard } from '../course-card/course-card';
import { CourseService } from '../../services/course-service';
import { Course } from '../../models/course';
import { LoadingService } from '../../services/loading-service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs';

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
    this.loadingService.isLoading$.next(true);
    this.courseService.catalogCourses$.subscribe(res=>{
      if(res.length!==0)this.courseList.set(res);
      else {
        this.getCourses()
      }
      this.loadingService.isLoading$.next(false);
    })

    this.searchQuery.valueChanges
    .pipe(
      debounceTime(400)
    )
    .subscribe(svalue=>{
      this.getCourses(svalue??"");
    })
    
  }


  getCourses = (val?:string)=>{
    this.courseService.getAllCourses(val).subscribe(res=>{
      this.courseList.set(res.result);
    })
  }


}
