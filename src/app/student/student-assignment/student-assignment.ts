import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AssignmentService } from '../../services/assignment-service';
import { Assignments } from '../../models/assignments';
import { CourseService } from '../../services/course-service';


@Component({
  selector: 'app-student-assignment',
  imports: [CommonModule],
  templateUrl: './student-assignment.html',
  styleUrl: './student-assignment.css',
})
export class StudentAssignment {


  private activatedRoutes = inject(ActivatedRoute);
  private toastService = inject(ToastrService);
  private assignmentService = inject(AssignmentService);
  private courseService = inject(CourseService);


  courseId!: string;
  selectedFile: File | null = null;

  assignedAssignment = signal<Assignments | null>(null)

  assignmentTitle: string | undefined;
  dueDate: string | undefined;
  totalMarks: number | undefined;
  fileId!: string | undefined;
  AssignmentId: string | undefined;



  constructor() { }

  ngOnInit() {
    this.courseId = this.activatedRoutes.snapshot.params['courseId'];
 
    this.assignmentService.selectedAssignment$.subscribe({
      next: (res) => {
        this.assignedAssignment.set(res);
        console.log(this.assignedAssignment())
        this.assignmentTitle = this.assignedAssignment()?.title;
        this.dueDate = String(this.assignedAssignment()?.dueDate).split('T')[0];
        this.totalMarks = this.assignedAssignment()?.totalMarks;
        this.fileId = this.assignedAssignment()?.file;
        this.AssignmentId = this.assignedAssignment()?._id;
      },
      error: (err) => {
        this.assignedAssignment.set(null);
      }
    })

  }



  downloadInstructorPdf(): void {
    this.assignmentService.downloadAssignmentStudent(this.courseId, this.fileId).subscribe({
      next: (blob: Blob) => {

        const downloadUrl = window.URL.createObjectURL(blob);


        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${this.assignmentTitle}${Date.now()}.pdf`;


        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      },
      error: (err) => {
        console.error('Download failed', err);
        this.toastService.error("Failed to download file.");
      }

    })


  }

  onFileSelected(event: any): void {
    console.log(event.target.files);
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedFile = file;
    } else {
      this.toastService.error('Please select a valid pdf file for the submission');
    }
  }

  submitResult(): void {
    const formData = new FormData();
    if (this.selectedFile) {
      formData.append('myFile', this.selectedFile);
    }

    this.assignmentService.uploadStudentAsignment(formData, this.courseId, this.AssignmentId).subscribe(
      {
        next:(res)=>{
          this.toastService.success("Assignment Submitted Successfully")
        },
        error:(err)=>{
          this.toastService.error("You have already uploaded the assignment");
        }
      }
    )
    this.selectedFile=null;
  }
}
