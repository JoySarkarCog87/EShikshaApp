import { LowerCasePipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { User } from '../../models/user';
import { CourseService } from '../../services/course-service';
import { LoadingService } from '../../services/loading-service';
import { TokenService } from '../../services/token-service';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, LowerCasePipe],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {

  private router = inject(Router);
  private userService = inject(UserService);
  private toastService=inject(ToastrService);
  private loadingService=inject(LoadingService);
  private tokenService = inject(TokenService);
  private courseService = inject(CourseService);

  navElements = input<string[]>();
  activeUser!:User;

  ngOnInit(){
    this.userService.activeUser$.subscribe(res=>{
      this.activeUser=res as User;
    })
  }

  getLink(navLink:string):string{
    if(navLink==="Dashboard" && this.activeUser?.role) return "./"+this.activeUser.role.toLocaleLowerCase();
    return navLink.replaceAll(" ","").toLowerCase();
  }

  logout(){
    this.loadingService.isLoading$.next(true);
    this.userService.logout().pipe(
      finalize(()=>this.loadingService.isLoading$.next(false))
    ).subscribe({
         next:(_)=>{
          this.tokenService.eshikshaToken = "";
          this.courseService.studentCourses$.next(null);
          this.router.navigateByUrl("");
         },
         error:(_)=>{
          this.toastService.error("problem during logout")
         }
    }
    )
  }

}
