import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Course } from '../../models/course';

@Component({
  selector: 'app-course-card',
  imports: [RouterModule],
  templateUrl: './course-card.html',
  styleUrl: './course-card.css',
})
export class CourseCard {
  course = input<Course>();


  getCourseDetailsPageLink = (coursId:string)=>{
    return `./coursedetails/${coursId}`
  }


}
