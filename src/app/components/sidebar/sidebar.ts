import { Component, inject, input, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user-service';
import { User } from '../../models/user';
import { LowerCasePipe } from '@angular/common';
import { Notification } from '../notification/notification';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from '../../services/loading-service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule,LowerCasePipe, Notification],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {

  router = inject(Router);
  userService = inject(UserService);
  toastService=inject(ToastrService);
  loadingService=inject(LoadingService);

  navElements = input<string[]>();
  activeUser!:User;
  showNotificaitonBox = signal<boolean>(false);

  ngOnInit(){
    this.userService.activeUser$.subscribe(res=>{
      this.activeUser=res as User;
    })
  }

  getLink(navLink:string):string{
    if(navLink==="Dashboard") return "./"+this.activeUser.role.toLocaleLowerCase();
    return navLink.replaceAll(" ","").toLowerCase();
  }

  logout(){
    
    this.loadingService.isLoading$.next(true);
    this.userService.logout().pipe(
      finalize(()=>this.loadingService.isLoading$.next(false))
    ).subscribe({
         next:(res)=>{
          localStorage.removeItem("eshikshaToken");
          this.router.navigateByUrl("");
          this.toastService.warning(res.message);
         },
         error:(err)=>{
          this.toastService.error("problem during logout")
         }
    }
      
    )
    
  }

  openNotificaionBox(){
    this.showNotificaitonBox.set(!this.showNotificaitonBox());
  }

}
