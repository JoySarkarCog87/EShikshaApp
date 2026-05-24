import { Component, inject } from '@angular/core';
import { User } from '../../models/user';
import { UserService } from '../../services/user-service';
import { Sidebar } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-student-page',
  imports: [Sidebar],
  templateUrl: './student-page.html',
  styleUrl: './student-page.css',
})
export class StudentPage {
  currentUser!:User;
  userService = inject(UserService);


  navElements = ["Dashboard", "Course Catalog", "Enrolled Courses","Announcement","Chat-Box","Community-Forum", "Settings"];

  ngOnInit(){
    this.userService.activeUser$.subscribe(res=>{
      if(res instanceof User){
        this.currentUser = res;
      }
    })
  }
}
