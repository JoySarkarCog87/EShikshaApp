import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user-service';
import { User } from '../../models/user';
import { RegisterFormValidator } from '../../validators/register-form-validator';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from '../../services/loading-service';
import { finalize } from 'rxjs';
import { isArray } from 'chart.js/helpers';


@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
  providers: [RegisterFormValidator]
})
export class Register {
  // Custom Services
  private userService = inject(UserService);
  private regFormValidator = inject(RegisterFormValidator);
  private loadingService = inject(LoadingService);
  
  // External Services
  private router=inject(Router);
  private formBuilder = inject(FormBuilder);
  private toasterService = inject(ToastrService);
  

  registerForm = this.formBuilder.group({
    name: ["", [Validators.required, Validators.pattern("[a-zA-Z ]+")]],
    email: ["", [Validators.required, Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")]],
    password: ["", [Validators.required, this.regFormValidator.passwordValidator]],
    confirmPassword: ["", [Validators.required]]
  },
    {
      validators: this.regFormValidator.passwordMatchValidator
    })

  register(){
    this.loadingService.isLoading$.next(true);
    const { name, email, password } = this.registerForm.value;
    if(name && email && password){
      this.userService.register(new User(name,email,password))
      .subscribe({
        next:res=>{
          this.toasterService.success(res.message as string);
          this.registerForm.reset();
        },
        error:err=>{
          if(err.error.message && isArray(err.error.message)){
            for(let i=0; i<err.error.message.length; i++){
              this.toasterService.error(err.error.message[i].msg);
            }
          }else{
            let errorMsg = err.error.message || "Internal server error";
            if(errorMsg.match("duplicate key")){
              errorMsg = "User Already exists";
            }
            this.toasterService.error(errorMsg);
          }
        }
      })
    }
  }

  goToHome(){
    this.router.navigate([""]);
  }


  get name(){
    return this.registerForm.get("name");
  }
  get email(){
    return this.registerForm.get("email");
  }
  get password(){
    return this.registerForm.get("password");
  }
  get role(){
    return this.registerForm.get("role");
  }
  get confirmPassword(){
    return this.registerForm.get("confirmPassword");
  }

}
