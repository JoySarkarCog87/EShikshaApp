import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user-service';
import { AuthUser } from '../../models/authUser';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from '../../services/loading-service';
import { finalize } from 'rxjs';
import { TokenService } from '../../services/token-service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  // custom services
  private userService = inject(UserService);
  private loadingService = inject(LoadingService);
  private tokenService = inject(TokenService);
  
  // external services
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private toastService = inject(ToastrService);

  loginForm = this.formBuilder.group({
    email: ["",[Validators.required]],
    password: ["",[Validators.required]]
  })
  
  login(){
    this.loadingService.isLoading$.next(true);
    const {email, password} = this.loginForm.value;
    if(email && password){
      this.userService.login(new AuthUser(email, password))
      .pipe(
        finalize(()=>this.loadingService.isLoading$.next(false))
      )
      .subscribe({
        next:(res)=>{
          if(res.result?.token){
            localStorage.setItem("eshikshaToken", res.result.token);
            this.router.navigateByUrl("dashboard");
          }
        },
        error:(err)=>{
          this.toastService.error(err?.error?.message??"Some internal server error occure");
          // console.log(err.error.message);
        }
      })
    }
  }
 
  goToHome(){
    this.router.navigate([""]);
  }

  get email(){
    return this.loginForm.get("email");
  }

  get password(){
    return this.loginForm.get("password");
  }

}
