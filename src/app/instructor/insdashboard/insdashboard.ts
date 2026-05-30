import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CourseService } from '../../services/course-service';
import { DashboardServices } from '../../services/dashboard-services';
import { ToastrService } from 'ngx-toastr';
import { RouterModule } from '@angular/router';
import { LoadingService } from '../../services/loading-service';
import { finalize } from 'rxjs';


@Component({
  selector: 'app-insdashboard',
  imports: [BaseChartDirective, RouterModule],
  templateUrl: './insdashboard.html',
  styleUrl: './insdashboard.css',
})
export class Insdashboard {

  private courseService = inject(CourseService);
  private dashboardService = inject(DashboardServices);
  private toastService=inject(ToastrService);
  private loadingService = inject(LoadingService);

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { display: false },
      x: { display: false }
    }
  };

  dashboardData = signal<any>('');

  ngOnInit(){
    this.loadingService.isLoading$.next(true);
    this.dashboardService.getInstructorDashboard()
    .pipe(
      finalize(()=>this.loadingService.isLoading$.next(false))
    )
    .subscribe({
      next:res=>{
        this.dashboardData.set(res.result);
        this.courseService.instructorCoursesList$.next(res.result?.courses?.map((c:any)=>({id:c._id, title:c.title, category:c.category})))
      },
      error:err=>{
        this.toastService.error(err.message);
        //console.log(err);
      }
    })
  }


  getTotalStudents():number{
    if(this.dashboardData()?.students?.length===0)return 0;
    return this.dashboardData()?.students
    ?.map((c:any)=>c.totalStudents)?.reduce((a:number,b:number)=>a+b)??0;
  }

  getAverageRating():string{
    if(this.dashboardData()?.courses?.length===0)return "0.0";
    return (this.dashboardData()?.courses?.map((c:any)=>{
      if(c.avarageRating?.$numberDecimal){
        return parseInt(c.avarageRating?.$numberDecimal)
      }
      return 0;
    })?.reduce((a:number,b:number)=>a+b)/this.dashboardData()?.courses?.length).toFixed(1)??0;
  }


  getTopThreeCourse(){
    return this.dashboardData()?.courses?.slice(0,3);
  }

  getLineChartData():ChartConfiguration['data']{

    const courses = this.dashboardData()?.courses;
    const students = this.dashboardData()?.students;
    
    const data = [];
    const labels = [];

    for(let i=0; i<5; i++){
      data.push(students[i]?.totalStudents??0);
      if(students[i]?.course){
        const ind = courses.findIndex((c:any)=>c._id===students[i]?.course);
        labels.push(`${courses[ind]?.title}\n${courses[ind]?.category}`)
      }else{
        labels.push("No")
      }
    }

    return {
      datasets: [
        {
          data: data,
          label: 'New Students',
          backgroundColor: [
            'rgba(255, 204, 86, 0.66)',
            'rgba(75, 192, 192, 0.66)',
            'rgba(54, 163, 235, 0.62)',
            'rgba(153, 102, 255, 0.68)',
            'rgba(201, 203, 207, 0.68)'
          ],
          borderColor: [
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)',
            'rgb(153, 102, 255)',
            'rgb(201, 203, 207)'
          ],
          pointBackgroundColor: '#0d6efd',
          pointBorderColor: '#fff',
          fill: 'origin',
          tension: 0.4 
        }
      ],
      labels: labels
    };
  }


}
