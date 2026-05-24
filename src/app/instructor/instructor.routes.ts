import { Routes } from "@angular/router";

export const instructorRoutes : Routes = [
    {path:"", loadComponent:()=>import("./instructor-page/instructor-page").then(r=>r.InstructorPage), children:[
        {path:"", redirectTo:"instructor", pathMatch:'full'},
        {path:"instructor", loadComponent:()=>import("./insdashboard/insdashboard").then(r=>r.Insdashboard)},
        {path:"settings", loadComponent:()=>import("../components/settings/settings").then(r=>r.Settings)},
        {path:"studentprogress", loadComponent:()=>import("./student-progress/student-progress").then(r=>r.StudentProgress)},
        {path:"assignments", loadComponent:()=>import("./manage-assignemts/manage-assignemts").then(r=>r.ManageAssignemts)},
        {path:"quizes", loadComponent:()=>import("./quizes/quizes").then(r=>r.Quizes)},
        {path:"managecourse", loadComponent:()=>import("../components/manage-course/manage-course").then(r=>r.ManageCourse)},
        {path:"announcements",loadComponent:()=>import("../components/announcements/announcements").then(r=>r.Announcements)},
        //{path: "aiassistant", loadComponent: () => import("../components/ai-assistant/ai-assistant").then(r => r.AiAssistantComponent) },
        {path:"community-forum",loadComponent:()=>import("../components/community-forum/community-forum").then(r=>r.CommunityForumComponent)},
        {path:"coursecatalog", loadComponent:()=>import("../components/course-catalog/course-catalog").then(r=>r.CourseCatalog)},
        {path:"coursecatalog/coursedetails/:courseId", loadComponent:()=>import("../components/course-details/course-details").then(r=>r.CourseDetails)},
        {path:"chat-box",loadComponent:()=>import("../components/chat-box/chat-box.component").then(r=>r.ChatBoxComponent)},
    ]}
]