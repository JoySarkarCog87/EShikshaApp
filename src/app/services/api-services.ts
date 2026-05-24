import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApiServices {

  BASE_URL = "http://localhost:8000";


  getFullUrl(endpoint:string):string{
    return `${this.BASE_URL}/${endpoint}`;
  }
  

}
