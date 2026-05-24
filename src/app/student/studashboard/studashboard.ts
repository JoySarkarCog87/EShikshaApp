import { Component, computed, inject, signal } from '@angular/core';
import { DashboardServices } from '../../services/dashboard-services';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-studashboard',
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './studashboard.html',
  styleUrl: './studashboard.css',
})
export class Studashboard {
  dasboardService = inject(DashboardServices);

  dashboardData = signal<any>('');

  ngOnInit(){
    this.dasboardService.getStudentDashboard().subscribe({
      next:res=>{
        this.dashboardData.set(res.result);
      },
      error:err=>{
        console.log(err);
      }
    })
  }

  getCourseCompletedCount(){
    if(this.dashboardData()?.enrolledCourses?.length===0)return 0;
    let count = 0;
    this.dashboardData()?.enrolledCourses?.forEach((ec:any)=>{
      if(ec.totalAttended===ec.totalModule)count++;
    })
    return count;
  }

  getAverageQuizMarks(){
    if(this.dashboardData()?.quizResult?.length===0)return 0;
    let obtainMarks = 0;
    let totalMarks = 0;
    this.dashboardData()?.quizResult.forEach((q:any)=>{
      obtainMarks+=q.obtainMarks;
      totalMarks+=q.quiz.totalMarks;
    })
    return ((obtainMarks/totalMarks)*100).toFixed(2);
  }

  getEnrolledCourses(){
    return  this.dashboardData()?.enrolledCourses?.slice(0,3);
  }

  getCourseCompletionPercentage(course:any){
    if(course.totalModule==0)return 100;
    if(course.totalAttended===0) return 0;
    return ((course.totalAttended/course.totalModule)*100).toFixed(2);
  }

  getEnrolledDateStatus(date:Date){
    const enrolledDate = new Date(date);
    if(enrolledDate.getDate()===new Date(Date.now()).getDate()) return "today";
    return `${enrolledDate.getDate()} ${enrolledDate.toLocaleDateString('en-US', {month:'short'})}`
  }
}
