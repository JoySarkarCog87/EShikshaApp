import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { CourseService } from '../../services/course-service';
import { map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from '../../services/loading-service';

@Component({
  selector: 'app-student-progress',
  imports: [CommonModule],
  templateUrl: './student-progress.html',
  styleUrl: './student-progress.css',
})
export class StudentProgress {
  private courseService = inject(CourseService);
  private loadinService = inject(LoadingService);
  private toastService = inject(ToastrService);
  
  instructorCourses = signal<{ id: string, title: string, category:string }[]>([]);
  studentsProgressData = signal<any|null>(null);

  ngOnInit(){
    this.courseService.instructorCoursesList$
    .subscribe(courses => {
      if (courses) {
        this.instructorCourses.set(courses)
      }
    })
  }


  onCourseChange(event:any){
    this.loadinService.isLoading$.next(true);
    this.courseService.getStudentsCourseReport(event.target.value)
    .pipe(
      finalize(()=>this.loadinService.isLoading$.next(false))
    )
    .subscribe({
      next:res=>{
        this.studentsProgressData.set(res.result);
      },
      error:_=>{
        this.toastService.error("Error while loading student progress.")
      }
    })
  }

  getAverageCourseComplitionRate():string{
    const data = this.studentsProgressData();
    const students = data?.students;
    const totalModules = data?.totalModules;

     if (!students || students.length === 0 || !totalModules) {
        return "0.00";
     }

     const totalCompletedModules = students.reduce((sum: number, s: any) => sum + (s.completedModule ?? 0), 0);

     const maxPossibleModules = totalModules * students.length;

     return ((totalCompletedModules / maxPossibleModules) * 100).toFixed(2);

  }

  getRiskStudentCount(){
    if(this.studentsProgressData()?.students?.length===0 || this.studentsProgressData()?.totalModules===0)return 0;
   
    return this.studentsProgressData()?.students?.filter((s:any)=>{
      //console.log(s.completedModule/this.studentsProgressData()?.totalModules)
      if((s.completedModule/this.studentsProgressData()?.totalModules)<0.1)return s;
    }).length;
  }

}
