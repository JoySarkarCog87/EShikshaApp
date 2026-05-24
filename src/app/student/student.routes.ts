import { Routes } from "@angular/router";

export const studentRoutes : Routes = [
    {path:"", loadComponent:()=>import("./student-page/student-page").then(r=>r.StudentPage), children:[
        {path:"", redirectTo:"student", pathMatch:"full"},
        {path:"student", loadComponent:()=>import("./studashboard/studashboard").then(r=>r.Studashboard)},
        {path:"coursecatalog", loadComponent:()=>import("../components/course-catalog/course-catalog").then(r=>r.CourseCatalog)},
        {path:"coursecatalog/coursedetails/:courseId", loadComponent:()=>import("../components/course-details/course-details").then(r=>r.CourseDetails)},
        {path:"settings", loadComponent:()=>import("../components/settings/settings").then(r=>r.Settings)},
        {path:"enrolledcourses", loadComponent:()=>import("./enrolled-courses/enrolled-courses").then(r=>r.EnrolledCourses)},
        {path:"enrolledcourses/result", loadComponent:()=>import("./result/result").then(r=>r.Result)},
        {path:"enrolledcourses/course", loadComponent:()=>import("./course-content/course-content").then(r=>r.CourseContent)},
        {path:"announcement",loadComponent:()=>import("../components/announcements/announcements").then(r=>r.Announcements)},
        {path:"chat-box", loadComponent:()=>import("../components/chat-box/chat-box.component").then(r=>r.ChatBoxComponent)},
        {path:"community-forum",loadComponent:()=>import("../components/community-forum/community-forum").then(r=>r.CommunityForumComponent)},
        {path:"enrolledcourses/coursedetails/:courseId", loadComponent:()=>import("../components/course-details/course-details").then(r=>r.CourseDetails)},
        {path:"enrolledcourses/coursedetails/:courseId/assignment/:id",loadComponent:()=>import("../student/student-assignment/student-assignment").then(r=>r.StudentAssignment)},
        {path:"chat-box",loadComponent:()=>import("../components/chat-box/chat-box.component").then(r=>r.ChatBoxComponent)},
    ]}
]