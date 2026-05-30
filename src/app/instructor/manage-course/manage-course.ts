import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Course } from '../../models/course';
import { CourseService } from '../../services/course-service';
import { UserService } from '../../services/user-service';
import { ToastrService } from 'ngx-toastr';
import { isArray } from 'chart.js/helpers';
import { combineLatest, switchMap } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-manage-course',
  imports: [ReactiveFormsModule],
  templateUrl: './manage-course.html',
  styleUrl: './manage-course.css',
})
export class ManageCourse {

  private fb = inject(FormBuilder);
  private courseService = inject(CourseService);
  private userService=inject (UserService);
  private toastService=inject(ToastrService);


  isEditMode = signal(false);
  oldCourseName = ""; // Used to find the course in the list if the name is changed
  courseId="";
  pageNumber = signal<number>(1);
  totalCourses = 0;

  courseForm = this.fb.group({
    title: ['', Validators.required],
    category: ['', Validators.required],
    description: ['', Validators.required],
    imageUrl:['',Validators.required]
  });

  courseList = signal<Course[]>([]);

  getCourses$ = combineLatest([
    this.userService.activeUser$,
    toObservable(this.pageNumber)
  ]).pipe(
    switchMap(([user, page])=>{
      return this.courseService.getAllCourses(page, "", user?._id);
    })
  )

  ngOnInit(){
    this.getCourses$.subscribe({
        next:courseResult=>{
          this.courseList.set(courseResult.result.courses)
          this.totalCourses = courseResult.result.totalCourses;
        },
        error:err=>{
          this.toastService.error(err.error.message??"Internal Server Error");
        }
    })
  }
   
  onSubmit() {
    const {title,category,description ,imageUrl}=this.courseForm.value;
    
    const updatedData={
      title:title??"",
      category:category??"",
      description:description??"",
      imageUrl:imageUrl??""
    }
    
    if(this.isEditMode()){
      if(this.courseForm.pristine){
        this.toastService.info('No changes detected');
        return;
      }
    
      this.courseService.updateCourse(this.courseId, updatedData ).subscribe({
         next:res=>{
          this.courseList.update(cArr=>cArr.map(c=>{
          if(c._id==res.result._id) return res.result;  
          return c; 
          }))

          this.toastService.success(res.message);
          this.resetForm();
        },
        error:err=>{
          if(isArray(err.error.message)){
            err.error.message.forEach((e:any)=>this.toastService.error(e.msg));
          }else if(err.error.message.match("duplicate key")){
            this.toastService.error("Course already exists with this details");
          }else{
            this.toastService.error(err.error.message??"Internal Server Error");
          }
        }
      })
    }
    else{
      if(title && category && description && imageUrl){  
        this.courseService.createCourse(new Course(title,category,description,imageUrl)).subscribe({
          next:res=>{
            const courses=this.courseList();
            courses.push(res.result)
            this.courseList.set(courses);
            this.toastService.success(res.message);
            this.resetForm();
          },
          error:err=>{
            console.log(err);
            if(isArray(err.error.message)){
              err.error.message.forEach((e:any)=>this.toastService.error(e.msg));
            }else{
              this.toastService.error(err.error.message??"Internal Server Error");
            }
          }
        })
      }
    }
  }
 
  editCourse(course: any) {
    this.isEditMode.set(true);
    this.oldCourseName = course.title;
    this.courseForm.patchValue({
      title: course.title,
      category: course.category,
      description: course.description,
      imageUrl:course.imageUrl
    });
    // console.log(course);
    // console.log(course._id);

    this.courseId=course._id;
  }
   
  deleteCourse(id: string) {
    this.courseService.deleteCourse(id).subscribe({
      next:res=>{
        if(confirm("Do you want to delete")){
        this.courseList.update(cArr=>cArr.filter(c=>c._id!==id))
        this.toastService.success(res.message);
      }
      },
      error:err=>{
        this.toastService.error(err.error.message);
      }
    })
  }
  
  resetForm() {
    this.courseForm.reset();
    this.isEditMode.set(false);
    this.oldCourseName = "";
  }

  goToNextPage(){
    if(this.pageNumber()<(this.totalCourses/6)){
      this.pageNumber.update(num=>++num);
    }
  }

  goToPreviousPage(){
    if(this.pageNumber()>1){
      this.pageNumber.update(num=>--num);
    }
  }



}
