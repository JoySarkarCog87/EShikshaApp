import { Component, inject, signal } from '@angular/core';
import { CourseService } from '../../services/course-service';
import { map } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-student-progress',
  imports: [CommonModule],
  templateUrl: './student-progress.html',
  styleUrl: './student-progress.css',
})
export class StudentProgress {
  courseService = inject(CourseService);
  
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
    console.log(event.target.value);
    this.courseService.getStudentsCourseReport(event.target.value).subscribe({
      next:res=>{
        this.studentsProgressData.set(res.result);
        console.log(res.result);
      },
      error:err=>{
        console.log(err);
      }
    })
  }

  getAverageCourseComplitionRate():string{
    if(this.studentsProgressData()?.students?.length===0)return "0.00";
    return ((this.studentsProgressData()?.students?.map((s:any)=>s.completedModule)?.reduce((a:number,b:number)=>a+b,0)/(this.studentsProgressData()?.totalModules*this.studentsProgressData()?.students?.length))*100).toFixed(2);
  }

  getRiskStudentCount(){
    if(this.studentsProgressData()?.students?.length===0 || this.studentsProgressData()?.totalModules===0)return 0;
    return this.studentsProgressData()?.students?.filter((s:any)=>{
      console.log(s.completedModule/this.studentsProgressData()?.totalModules)
      if((s.completedModule/this.studentsProgressData()?.totalModules)<0.1)return s;
    }).length;
  }
}
