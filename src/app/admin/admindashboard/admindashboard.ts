import { Component, inject, signal } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { LoadingService } from '../../services/loading-service';
import { DashboardServices } from '../../services/dashboard-services';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-admindashboard',
  imports: [BaseChartDirective, DatePipe, CommonModule],
  templateUrl: './admindashboard.html',
  styleUrl: './admindashboard.css',
})
export class Admindashboard {
  private loadingService = inject(LoadingService);
  private dashboardService = inject(DashboardServices);

  dashboardData = signal<any>('');
  currentDate = new Date();
  lineChartDataSets = [
    {
      data: [0, 0, 0, 0, 0],
      label: 'INSTRUCTOR',
      fill: true,
      tension: 0.5,
      borderColor: 'rgba(75,192,192,1)',
      backgroundColor: 'rgba(75,192,192,0.2)'
    },
    {
      data: [0, 0, 0, 0, 0],
      label: 'STUDENT',
      borderColor:'rgba(255,99,132,1)',
      backgroundColor:'rgba(255,99,132,0.2)'
    }
  ]
  monthLabels:number[]=[];
  showChart = signal<boolean>(false);


  public lineChartData = signal<ChartConfiguration<'line'>['data']>({
          labels: ["January", "February", "March", "April", "May"],
          datasets: this.lineChartDataSets
        });

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {display:true},
      title: {display:true, text:"Monthly Student and Teacher Joining"}
    }
  }


  ngOnInit(){
    this.loadingService.isLoading$.next(false);
    this.dashboardService.getAdminDashboard().subscribe({
      next:res=>{
        this.dashboardData.set(res.result);
        this.getLineChartData(res.result.userDetails.monthlyEnrollments);
        this.lineChartData.set({
          labels: this.getMonthsList(this.monthLabels),
          datasets: this.lineChartDataSets
        })
        this.showChart.set(true);
      },
      error:err=>{
        console.log(err);
      }
    })
  }


  getLineChartData(monthlyEnrollments:any){
    const months = new Set<number>();
    const instructor = monthlyEnrollments.filter((e:any)=>e.role==="INSTRUCTOR");
    const students = monthlyEnrollments.filter((e:any)=>e.role==="STUDENT");

    for(let i=0; i<5; i++){
      this.lineChartDataSets[0].data[i]=instructor[i]?.count??0;
      if(instructor[i]?.month){
        months.add(instructor[i].month);
      }
    }

    for(let i=0; i<5; i++){
      this.lineChartDataSets[1].data[i]=students[i]?.count??0;
      if(students[i]?.month){
        months.add(students[i].month);
      }
    }

    this.monthLabels=[...months];
  }

 getMonthsList(montsArr: number[]): string[] {
    return montsArr.map(n => {
      switch (n) {
        case 1: return "January";
        case 2: return "February";
        case 3: return "March";
        case 4: return "April";
        case 5: return "May";
        case 6: return "June";
        case 7: return "July";
        case 8: return "August";
        case 9: return "September";
        case 10: return "October";
        case 11: return "November";
        case 12: return "December";
        default: return "Invalid Month";
      }
    });
  }

  getCoursePercentange(averageRating:number){
    return Math.floor((averageRating/5)*100)
  }

  getTotalUser(){
    return this.dashboardData()?.userDetails?.totalUser.map((u:any)=>u.total).reduce((a:number,b:number)=>a+b)
  }

}
