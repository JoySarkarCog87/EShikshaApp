import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Course } from '../../models/course';
import { CourseService } from '../../services/course-service';
import { UserService } from '../../services/user-service';
import { ToastrService } from 'ngx-toastr';
import { required } from '@angular/forms/signals';
import { isArray } from 'chart.js/helpers';

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

  courseForm = this.fb.group({
    title: ['', Validators.required],
    category: ['', Validators.required],
    description: ['', Validators.required],
    imageUrl:['',Validators.required]
  });

  courseList = signal<Course[]>([]);

  ngOnInit(){
    this.courseService.instructorCourses$.subscribe(res=>{
      if(!res){
        this.userService.activeUser$.subscribe(user=>{
          this.courseService.getAllCourses("",user?._id).subscribe({
            next:courseResult=>{
              this.courseService.instructorCourses$.next(courseResult.result);
              this.courseList.set(courseResult.result)
              console.log(this.courseList());
            },
            error:err=>{
              this.toastService.error(err.error.message??"Internal Server Error");
            }
          })
        })
      }else{
        this.courseList.set(res);
      }
    })  
  }
   
  onSubmit() {
    console.log(this.courseForm.value);
    const {title,category,description ,imageUrl}=this.courseForm.value;

    const updatedData={
      title:title??"",
      category:category??"",
      description:description??"",
      imageUrl:imageUrl??""
    }
    
    if(this.isEditMode()){
      this.courseService.updateCourse(this.courseId, updatedData ).subscribe({
         next:res=>{
          console.log("this is result:");
          console.log(res.result);
          this.courseList.update(cArr=>cArr.map(c=>{
          if(c._id==res.result._id) return res.result;  
          return c; 
          }))

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
    console.log(course);
    console.log(course._id);

    this.courseId=course._id;
  }
   
  deleteCourse(id: string) {
    this.courseService.deleteCourse(id).subscribe({
      next:res=>{
        this.courseList.update(cArr=>cArr.filter(c=>c._id!==id))
        this.toastService.success(res.message);
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

  //some extra
  updateExistingCourse(v:any,n:any){}

  addCourse(v:any){}

  removeCourse(c:any){}

}
