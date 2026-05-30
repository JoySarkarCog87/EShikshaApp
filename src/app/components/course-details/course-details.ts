import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../services/course-service';
import { Course } from '../../models/course';
import { Assignments } from '../../models/assignments';
import { CommonModule} from '@angular/common';
import { AssignmentService } from '../../services/assignment-service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../services/user-service';
import { combineLatest, finalize, map, Observable } from 'rxjs';
import { TokenService } from '../../services/token-service';
import { FormsModule } from '@angular/forms';
import { LoadingService } from '../../services/loading-service';

@Component({
  selector: 'app-course-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './course-details.html',
  styleUrl: './course-details.css',
})
export class CourseDetails {

  private activatedRoute = inject(ActivatedRoute);
  private courseService = inject(CourseService);
  private userService = inject(UserService);
  private assignmentService=inject(AssignmentService);
  private toastService=inject(ToastrService);

  private router = inject(Router);
  private tokenService = inject(TokenService);
  private loadinService = inject(LoadingService);

  courseId1!: string;
  selectedCourse = signal<{ course: Course, assignments: Assignments[], quizzes:any[], totalEnrollments:number, isEnrolled:boolean } | null>(null);
  selectedRating = 0;
  feedback = "";
  userName = "";
  currentRating = signal<number>(0);

  setRating(ratingValue: number) {
    this.currentRating.set(ratingValue);
  }

  reviewText = signal<string>('');

  marksArray=signal<{quizResults:{[key:string]:any[]}, assignmentResults:{[key:string]:number}}|null>(null);

  ngOnInit() {
    this.courseId1 = this.activatedRoute.snapshot.params['courseId'];
    let user;
    if(this.tokenService.eshikshaToken){
      user = this.tokenService.decodeToken(this.tokenService.eshikshaToken)
    }
    this.courseService.getCourseById(this.courseId1, user?._id??'').subscribe({
      next: res=>{
        this.selectedCourse.set(res.result);
      },
      error: _=>{
        this.toastService.error("Error While loading course details");
      }
    })
    if(user && user.role==="STUDENT"){
      this.courseService.getAllResults(this.courseId1).subscribe(
        {
          next:(res)=>{
            this.marksArray.set(res.result);
          },
          error:(_)=>{
              this.toastService.error("something went wrong");
          }
        }
      )
    }
  }

  enroll() {
    this.courseService.enrollCourse(this.courseId1).subscribe({
      next:res=>{
        const currentCourses = this.courseService.studentCourses$.getValue()??[];
        this.courseService.studentCourses$.next([res.result, ...currentCourses]);
        this.selectedCourse.update(course=>{
          if(!course) return null;
          return {...course, isEnrolled:true};
        });
        this.toastService.success(`Successfully enrolled in ${this.selectedCourse()?.course?.title||""}!`);
      },
      error:err=>{
        let message = err?.error?.message;
        if(message.match("duplicate key")){
          message = "You already enrolled in this course";
        }
        this.toastService.error(message??"Internal Server Error");
      }
    })
  }

  unrenroll(){
    this.courseService.deleteEnrollment(this.courseId1).subscribe({
      next:res=>{
        this.selectedCourse.update(course=>{
          if(!course) return null;
          return {...course, isEnrolled:false};
        });
        this.toastService.success(res.message);
      },
      error:err=>{
        this.toastService.error(err.error.message??"Internal Server Error");
      }
    })
  }


  goToSubmitAssignment(assignment:Assignments) {
    this.assignmentService.selectedAssignment$.next(assignment);
    console.log(assignment);
    this.router.navigate(
      ['/dashboard/enrolledcourses/coursedetails', this.courseId1, 'assignment', assignment._id]
    );

  }

  startQuiz(quizId:string){
    if(confirm("Do you want to start this quiz?")){
      this.router.navigate(["/coursedetails", this.courseId1, 'quiz', quizId]);
    }
  }

  enrollmentAccessStatus():Observable<'blocked' | 'nonblock'>{
    return combineLatest(
      [this.userService.activeUser$]
    ).pipe(
      map(([user])=>{
        this.userName=user?.name??"";
        if (user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR') {
          return 'blocked';
        }

        return 'nonblock'
      })
    )
  }


  submitReview(){
    if(this.selectedRating===0 || this.feedback===""){
      this.toastService.warning("correctly fill rating and feedback");
      return;
    }
    this.loadinService.isLoading$.next(true);
    this.courseService.submitRating(this.courseId1, {name:this.userName, rating:this.selectedRating, feedback:this.feedback})
    .pipe(
      finalize(()=>this.loadinService.isLoading$.next(false))
    )
    .subscribe({
      next:res=>{
        this.selectedCourse.update(c=>{
          if(!c) return null;
          return {...c, feedback:res.result?.feedback??[]}
        })
        this.toastService.success(res.message);
      },
      error:err=>{
        this.toastService.error(err.error.message??"Error while posting review");
      }
    })
  }
}
