import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { TokenService } from '../services/token-service';
import { UserService } from '../services/user-service';

export const adminAuthGuard: CanMatchFn = async (route, segments) => {
  const token = localStorage.getItem("eshikshaToken");
  const tokenService = inject(TokenService);
  const router = inject(Router);
  const userService = inject(UserService);

  if(!token) return router.createUrlTree([""]);

  const data = tokenService.decodeToken(token);

  const isSettingsSet = await new Promise((resolve, reject)=>{
    userService.getUserSettings().subscribe({
      next:res=>{
        userService.activeUser$.next({...res.result,_id:data._id});
        resolve(true);
      },
      error:_=>{
        reject(false);
      }
    })
  })

  if(!isSettingsSet) router.navigateByUrl("");
  
  if(data && data.role==="ADMIN"){
    return true;
  }
  return false;

};


