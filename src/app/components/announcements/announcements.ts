import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user-service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CourseService } from '../../services/course-service';
import { ToastrService } from 'ngx-toastr';
import { AnnouncementService } from '../../services/announcement-service';
import { LoadingService } from '../../services/loading-service';
import { finalize } from 'rxjs';


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
  private loadingService = inject(LoadingService);

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
    this.announcementForm = this.fb.group({
      courseId: ['', Validators.required],
      messageText: ['', [Validators.required, Validators.minLength(5)]]
    });


    this.courseService.instructorCoursesList$
      .subscribe(courses => {
        if (courses) this.instructorCourses.set(courses);
      });


    this.userService.activeUser$.subscribe(user => {
      this.isInstructor = user?.role === "INSTRUCTOR";
      if(this.isInstructor){
         this.announcementForm.get('courseId')?.valueChanges.subscribe(value=>{
          if(!value)return;
          this.loadingService.isLoading$.next(true)
          this.annnouncementService.loadInstructorAnnouncements(value)
          .pipe(
            finalize(()=>this.loadingService.isLoading$.next(false))
          )
          .subscribe({
            next:res=>{
              this.notifications.set(res.result);
            },
            error: err => {
              this.toastService.error(err.message)
            }
          })

        })
      }else{
        this.loadingService.isLoading$.next(true)
        this.annnouncementService.loadStudentAnnouncements()
        .pipe(
          finalize(()=>this.loadingService.isLoading$.next(false))
        )
        .subscribe({
          next:res=>{
            this.notifications.set(res.result);
          },
          error:_=>{
            this.toastService.error("Error while loading announcements.");
          }
        })
      }
    });


  }

  getCourseName(id: string) {
    return this.instructorCourses().find(c => c.id == id)?.title || 'Selected Course';
  }

  postAnnouncement() {
    if (this.announcementForm.invalid) return;
    this.loadingService.isLoading$.next(true);
    this.annnouncementService.postAnnouncement(this.announcementForm.value.courseId, {message:this.announcementForm.value.messageText})
    .pipe(
      finalize(()=>this.loadingService.isLoading$.next(false))
    )
    .subscribe({
      next: (res) => {
        this.announcementForm.reset({ courseId: '', messageText: '' });
        this.notifications.set([res.result, ...this.notifications() ?? []])
        this.toastService.success("Announcement broadcasted successfully!");
      },
      error: (err) => {
        this.toastService.error(err.error?.message || "Failed to post announcement");
      }
    })

  }
}