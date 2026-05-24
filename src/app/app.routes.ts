import { Routes } from '@angular/router';
import { Landing } from './components/landing/landing';
import { adminAuthGuard } from './routeGards/admin-auth-guard';
import { instructorAuthGuard } from './routeGards/instructor-auth-guard';
import { adminRoutes } from './admin/admin.routes';
import { instructorRoutes } from './instructor/instructor.routes';
import { studentRoutes } from './student/student.routes';

export const routes: Routes = [
    {path:"", component:Landing},
    {path:"coursedetails/:courseId", loadComponent:()=>import("./components/course-details/course-details").then(r=>r.CourseDetails)},
    {path:"coursedetails/:courseId/quiz/:id",loadComponent:()=>import("./student/student-quizes/student-quizes").then(r=>r.StudentQuizes)},
    {path:"login", loadComponent:()=>import("./components/login/login").then(r=>r.Login)},
    {path:"register", loadComponent:()=>import("./components/register/register").then(r=>r.Register)},
    {path:"dashboard", loadChildren:()=>adminRoutes, canMatch:[adminAuthGuard],},
    {path:"dashboard", loadChildren:()=>instructorRoutes, canMatch:[instructorAuthGuard]},
    {path:"dashboard", loadChildren:()=>studentRoutes},
    {path:"**", loadComponent:()=>import("./components/not-found/not-found").then(r=>r.NotFound)}
];
