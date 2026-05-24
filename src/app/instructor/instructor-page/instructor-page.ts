import { Component, inject } from '@angular/core';
import { User } from '../../models/user';
import { UserService } from '../../services/user-service';
import { Sidebar } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-instructor-page',
  imports: [Sidebar],
  templateUrl: './instructor-page.html',
  styleUrl: './instructor-page.css',
})
export class InstructorPage {
  currentUser!:User;
  userService = inject(UserService);


  navElements = ["Dashboard", "Manage Course", "Quizes", "Assignments", "Student Progress", "Announcements","Chat-Box"," community-Forum" ,"Settings"];

  ngOnInit(){
    this.userService.activeUser$.subscribe(res=>{
      if(res instanceof User){
        this.currentUser = res;
      }
    })
  }
}
