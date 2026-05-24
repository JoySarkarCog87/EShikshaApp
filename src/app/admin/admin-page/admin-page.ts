import { Component, inject } from '@angular/core';
import { User } from '../../models/user';
import { UserService } from '../../services/user-service';
import { Sidebar } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-admin-page',
  imports: [Sidebar],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.css',
})
export class AdminPage {
  currentUser!:User;
  userService = inject(UserService);


  navElements = ["Dashboard", "Manage Users", "Course Catalog", "Settings"];

  ngOnInit(){
    this.userService.activeUser$.subscribe(res=>{
      if(res instanceof User){
        this.currentUser = res;
      }
    })
  }
}
