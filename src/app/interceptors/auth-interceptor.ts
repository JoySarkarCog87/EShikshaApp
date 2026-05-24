import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  let authReq = req;
  if(req.url.includes("auth") || req.url.includes('register')){
    return next(authReq);
  }else{
    const token = localStorage.getItem("eshikshaToken");
    if(token){
      authReq = req.clone({
        setHeaders:{
          Authorization: `Bearer ${token}`
        }
      });
    }
  }
  return next(authReq);
};
