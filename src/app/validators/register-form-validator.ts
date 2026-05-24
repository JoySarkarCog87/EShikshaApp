import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class RegisterFormValidator {
  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    // If we don't have both controls, exit early
    if (!password || !confirmPassword) return null;

    // If passwords don't match
    if (password.value !== confirmPassword.value) {
      const error = { mismatch: true };
      confirmPassword.setErrors({ ...confirmPassword.errors, ...error });
      return error;
    } else {
      // If they match, remove the 'mismatch' error specifically
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
    let errors:{[key:string]:string} = {};
    if(!password) return null;
    if(!password.match(/[a-z]+/)){
      errors['lowerCaseError'] = "Atleast one lowercase letter";
    }
    if(!password.match(/[A-Z]+/)){
      errors['upperCaseError'] = "Atleast one uppercase letter";
    }
    if(!password.match(/[\d]+/)){
      errors['digitError'] = "Atleast one digit";
    }
    if(!password.match(/[@#$%^&*]+/)){
      errors['specialError'] = "Atleast one special character";
    }
    return errors?errors:null;
  }
}
