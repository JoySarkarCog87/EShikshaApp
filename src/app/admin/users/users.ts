import { Component, inject, signal } from '@angular/core';
import { User } from '../../models/user';
import { UserService } from '../../services/user-service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { combineLatest, debounceTime, distinctUntilChanged, startWith, switchMap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { toObservable } from '@angular/core/rxjs-interop';
import { LoadingService } from '../../services/loading-service';

@Component({
  selector: 'app-users',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users {

  private userService = inject(UserService);
  private toastService = inject(ToastrService);
  private formBuilder = inject(FormBuilder);
  private loadingService = inject(LoadingService);

  users = signal<{users:User[], totalUsers:number}>({users:[], totalUsers:0});
  selectedRole!:string;

  searchText = new FormControl('');
  setEditUser = signal<string>('');
  updatedRole = new FormControl('');
  currentPage = signal<number>(1);
  openInputRow = signal<boolean>(false);


  instructorData = this.formBuilder.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")]]
  })

  getUser$ = combineLatest([
      toObservable(this.currentPage),
      this.searchText.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        startWith(this.searchText.value || '')
      )
    ]).pipe(
      tap(()=>this.loadingService.isLoading$.next(true)),
      switchMap(([page, value])=>{
        return this.userService.getUsers(this.selectedRole||'ALL', value??'', page).pipe(
          finalize(()=>this.loadingService.isLoading$.next(false))
        )
      })
    )

    get email(){
    return this.instructorData.get('email');
    }

  ngOnInit(){
    this.getUser$
    .subscribe({
      next:res=>{
        this.users.set(res.result);
      },
      error:err=>{
        this.toastService.error(err.error?.message??"Error while geting the users");
      }
    })
  }

  filterUser(){
    this.getTableData(this.selectedRole, this.searchText.value??'');
  }

  getTableData = (role:string,searchVal?:string)=>{
    this.loadingService.isLoading$.next(true);
    this.userService.getUsers(role,searchVal)
    .pipe(
      finalize(()=>this.loadingService.isLoading$.next(false))
    )
    .subscribe(res=>{
      this.users.set(res.result)
    });
  }

  getAvtarUrl(name:string, role:string):string{
    const formattedName = name.split(" ").join("+");
    return `https://ui-avatars.com/api/?name=${formattedName}&${role==="STUDENT"?"background=E6FAFF&color=0DCAF0":"background=E8F1FF&color=0D6EFD"}`;
  }

  editUser(user:User, ind:number){
    if(user._id && this.setEditUser()===user._id){
      if(!this.updatedRole.touched){
        this.setEditUser.set('');
        return;
      }
      this.loadingService.isLoading$.next(true);
      this.userService.updateUser(user._id, this.updatedRole.value??'')
      .pipe(
        finalize(()=>this.loadingService.isLoading$.next(false))
      )
      .subscribe({
        next:res=>{
          this.updateUserTableData(user, 'update', ind);
          this.setEditUser.set('');
          this.toastService.success(res.message);
        },
        error:err=>{
          this.toastService.error(err.error?.message??"Error while editing the user");
        }
      })
    }else{
      this.updatedRole.setValue(user?.role??'');
      this.setEditUser.set(user._id??"");
    }
  }

  deleteUser(user:User){
    if(user._id){
      this.loadingService.isLoading$.next(true)
      this.userService.deleteUser(user._id)
      .pipe(
        finalize(()=>this.loadingService.isLoading$.next(false))
      )
      .subscribe({
        next:res=>{
          this.updateUserTableData(user, 'delete');
          this.toastService.success(res.message);
        },
        error:err=>{
          this.toastService.error(err.error?.message??"Error while deleting the user");
        }
      })
    }
  }

  updateUserTableData = (user:User, action:'update'|'delete', ind?:number)=>{
    if(action==='delete'){
      this.users.set({users:this.users().users.filter(u=>u._id!==user._id), totalUsers:this.users().totalUsers-1});
    }else if(action==='update' && ind){
      const updatedUser = {...user, role:this.updatedRole.value??user.role};
      this.users.update(usersData=>{
        return {
          ...usersData,
          users: usersData.users.map(u=>{
            if(u._id===user._id)return updatedUser;
            return u;
          })
        }
      });
    }
  }

  goToPreviousPage(){
    if(this.currentPage()>1){
      this.currentPage.update(pageNumber=>--pageNumber);
    }
  }

  goToNextPage(){
    if(this.currentPage()<(this.users().totalUsers/5)){
      this.currentPage.update(pageNumber=>++pageNumber);
    }
  }

  toggoleInputRow(){
    this.openInputRow.update(pre=>!pre);
  }

  createInstructor(){
    const {name, email} = this.instructorData.value;
    if(name && email){
      this.loadingService.isLoading$.next(true)
      this.userService.addInstructor({name, email})
      .pipe(
        finalize(()=>this.loadingService.isLoading$.next(false))
      )
      .subscribe({
        next:res=>{
          this.users.update(uarr=>{
            uarr.users = [res.result, ...uarr.users];
            return uarr;
          })
          this.openInputRow.set(false);
          this.toastService.success(res.message);
        },
        error:err=>{
          this.toastService.error(err?.error?.message || "Error while creating instructor");
        }
      })
    }
  }

  
}
