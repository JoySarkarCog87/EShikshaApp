// import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// @Injectable()

export class RegisterFormValidator {
  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');


    if (!password || !confirmPassword) return null;

    if (password.value !== confirmPassword.value) {
      const mismatchError = { mismatch: true };
      confirmPassword.setErrors({ ...confirmPassword.errors, ...mismatchError });
      return mismatchError;

    } else {
      
      if (confirmPassword.errors) {
        delete confirmPassword.errors['mismatch'];

        if (Object.keys(confirmPassword.errors).length === 0) {
          confirmPassword.setErrors(null);
        }

      } 
      return null;
    }
  };

  passwordValidator : ValidatorFn = (control: AbstractControl):ValidationErrors|null => {
    const password = control.value;
    let perrors:{[key:string]:string} = {};

    if(!password) return null;
    
    if(!password.match(/[a-z]+/)){
      perrors['lowerCaseError'] = "Atleast one lowercase letter";
    }
    if(!password.match(/[A-Z]+/)){
      perrors['upperCaseError'] = "Atleast one uppercase letter";
    }
    if(!password.match(/[\d]+/)){
      perrors['digitError'] = "Atleast one digit";
    }
    if(!password.match(/[@#$%^&*]+/)){
      perrors['specialError'] = "Atleast one special character";
    }
    return perrors?perrors:null;
  }
}
