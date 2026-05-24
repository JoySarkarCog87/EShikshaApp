import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user-service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CourseService } from '../../services/course-service';
import { map } from 'rxjs';
import { AssignmentService } from '../../services/assignment-service';
import { ToastrService } from 'ngx-toastr';
import { Assignments } from '../../models/assignments';
import { AnnouncementService } from '../../services/announcement-service';
import { isArray } from 'chart.js/helpers';


@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './announcements.html',
  styleUrls: ['./announcements.css']
})
export class Announcements implements OnInit {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private courseService = inject(CourseService);
  private toastService = inject(ToastrService);
  private annnouncementService = inject(AnnouncementService);

  notifications = signal<{
  message:string,
  course:{
    title:string,
    category:string
  },
  createdAt:Date,
  instructor?:{
    name?:string
  }
}[]|null>(null);

  instructorCourses = signal<{ id: string, title: string, category: string }[]>([]);
  
  announcementForm!: FormGroup; 
  isInstructor = false; 

  ngOnInit() {
    // Reactive Form controls initialization
    this.announcementForm = this.fb.group({
      courseId: ['', Validators.required],
      messageText: ['', [Validators.required, Validators.minLength(5)]]
    });

  
    this.courseService.instructorCoursesList$
      .subscribe(courses => {
        if (courses) this.instructorCourses.set(courses);
      });

    // Main authenticated login logic integration tracking
    this.userService.activeUser$.subscribe(user => {
      this.isInstructor = user?.role === "INSTRUCTOR";
      if(this.isInstructor){
         this.announcementForm.get('courseId')?.valueChanges.subscribe(value=>{
          if(!value)return;
          this.annnouncementService.loadInstructorAnnouncements(value).subscribe({
            next:res=>{
              this.notifications.set(res.result);
              console.log(res.result);
            },
            error:err=>{
              console.log(err);
            }
          })
          
        })
      }else{
        this.annnouncementService.loadStudentAnnouncements().subscribe({
          next:res=>{
            this.notifications.set(res.result);
          },
          error:err=>{
            console.log(err);
          }
        })
      }
    });

   
  }//authentication 

  getCourseName(id: string) {
    return this.instructorCourses().find(c => c.id == id)?.title || 'Selected Course';//selecting course
  }

  postAnnouncement() {
    if (this.announcementForm.invalid) return;

    this.annnouncementService.postAnnouncement(this.announcementForm.value.courseId, {message:this.announcementForm.value.messageText}).subscribe({
      next: (res) => {
        console.log(res);
        this.announcementForm.reset({ courseId: '', messageText: '' });
        this.notifications.set([res.result, ...this.notifications()??[]])
        this.toastService.success("Announcement broadcasted successfully!");
      },
      error: (err) => {
        console.error('Failed to post announcement', err);
        this.toastService.error(err.error?.message || "Failed to post announcement");
      }
    })

  }
}