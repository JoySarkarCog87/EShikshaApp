import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AssignmentsResult } from '../../models/assignmentResult';
import { Assignments } from '../../models/assignments';
import { AssignmentService } from '../../services/assignment-service';
import { CourseService } from '../../services/course-service';

@Component({
  selector: 'app-manage-assignemts',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './manage-assignemts.html',
  styleUrl: './manage-assignemts.css',
})
export class ManageAssignemts {

  private fb = inject(FormBuilder);
  private courseService = inject(CourseService);
  private assignmentService = inject(AssignmentService);
  private toastService = inject(ToastrService);

  assignmentForm!: FormGroup;
  publishedAssignments = signal<Assignments[]>([]);

  isEditMode = false;
  currentEditAssignmentId: string | null = null;
  selectedFile: File | null = null;

  studentName!: string;
  studentId!: string;

  AssignmentResponses = signal<AssignmentsResult[]>([]);

  StudentResponse = signal<AssignmentsResult[]>([]);

  viewResponses = false;
  maximumMarks = signal<number>(0);

  //API DATA
  instructorCourses = signal<{ id: string, title: string, category: string }[]>([]);

  //Getting instructor courses ==========================================================
  ngOnInit() {
    this.courseService.instructorCoursesList$
      .subscribe(courses => {
        if (courses) {
          this.instructorCourses.set(courses)
        }
      })

    this.assignmentForm = this.fb.group({
      courseId: ['', Validators.required],
      title: ['', [Validators.required, Validators.minLength(5)]],
      dueDate: ['', Validators.required],
      totalMarks: ['', [Validators.required, Validators.min(1)]]
    });

    this.assignmentForm.get('courseId')?.valueChanges.subscribe(courseId => {
      if (courseId) {
        this.assignmentService.searchAssignment(courseId).subscribe({
          next: (res) => {
            this.publishedAssignments.set(res.result);
          },
          error: (err) => {
            this.publishedAssignments.set([])
            this.toastService.error(err.error.message || "Internal server error");
          }
        });
      }
    });
  }

  getCourseName(id: string) {
    return this.instructorCourses().find(c => c.id == id)?.title || 'Selected Course';
  }

  get title() {
    return this.assignmentForm.get("title");
  }

  get dueDate() {
    return this.assignmentForm.get("dueDate");
  }

  get totalMarks() {
    return this.assignmentForm.get("totalMarks");
  }

  //==========================================================================================

  onEdit(assignment: Assignments) {
    window.scrollTo({
      top: 10,       // vertical position in pixels
      behavior: 'smooth' // smooth animation
    });

    this.isEditMode = true;
    this.currentEditAssignmentId = assignment._id || null;

    const formattedDate = String(assignment.dueDate).split('T')[0];

    this.assignmentForm.patchValue({
      title: assignment.title,
      dueDate: formattedDate,
      totalMarks: assignment.totalMarks

    });
    this.assignmentForm.markAsPristine();
  }

  //================================================================================

  onPublish() {
    if (this.assignmentForm.invalid) return;

    const formData = new FormData();
    const courseId = this.assignmentForm.get('courseId')?.value;

    formData.append('title', this.assignmentForm.value.title);
    formData.append('dueDate', this.assignmentForm.value.dueDate);
    formData.append('totalMarks', this.assignmentForm.value.totalMarks);

    if (this.selectedFile) {
      formData.append('myFile', this.selectedFile);
    }

    if (this.isEditMode && this.currentEditAssignmentId) {
      if (this.assignmentForm.pristine && !this.selectedFile) {
        this.toastService.info("No changes detected");
        return;
      }
      this.assignmentService.updateAssignments(formData, courseId, this.currentEditAssignmentId).subscribe({
        next: (res) => {
          this.toastService.success("Updated successfully");

          this.resetForm();
          this.assignmentForm.get('courseId')?.setValue(courseId);
        }
      });

    } else {
      if (!this.selectedFile) {
        this.toastService.warning("Please select a PDF")
        return;
      };

      this.assignmentService.addAssignments(formData, courseId).subscribe({
        next: (res) => {
          this.publishedAssignments().push(res.result);
          this.assignmentForm.reset({ courseId: courseId });
          this.selectedFile = null;
          this.toastService.success("Assignment published");
        },
        error: (err) => {
          this.toastService.error("problem occured during publishing assignment")
          this.assignmentForm.reset();
        }
      });


    }
  }

  onDelete(id: string | undefined) {
    const courseId = this.assignmentForm.get('courseId')?.value;
    if (id && courseId && confirm('Permanently delete this assessment?')) {
      this.assignmentService.deleteAssignment(id, courseId).subscribe({
        next: () => {
          this.publishedAssignments.set(this.publishedAssignments().filter(a => a._id !== id));
          this.toastService.success("assignment deleted")
        },
        error: (err) => alert("Delete failed")
      });
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedFile = file;
    }
  }

  resetForm() {

    const courseId = this.assignmentForm.get('courseId')?.value;

    this.isEditMode = false;
    this.currentEditAssignmentId = null;
    this.selectedFile = null;
    this.assignmentForm.reset({ courseId });

  }

  onDownload(assignment: any) {
    const courseId = this.assignmentForm.get('courseId')?.value;
    if (!assignment.file || !courseId) return;

    this.assignmentService.downloadAssignmentInstructor(courseId, assignment.file).subscribe({
      next: (blob: Blob) => {

        const downloadUrl = window.URL.createObjectURL(blob);


        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${assignment.title}_assignment.pdf`;


        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      },
      error: (err) => {
        this.toastService.error("Failed to download file.");
      }
    });
  }

  getCurrentDate(): string {
    const today = new Date();
    today.setDate(today.getDate() + 3);
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }


  onSetMarks(result: AssignmentsResult, givenMarks: number) {
    console.log(result);
    if (isNaN(givenMarks) || givenMarks < 0 || givenMarks > this.maximumMarks()) {
      this.toastService.warning(`Please enter a valid mark between 0 and ${this.maximumMarks()}`);
      return;
    }
    this.assignmentService.giveMarks(result._id, this.assignmentForm.get('courseId')?.value, givenMarks).subscribe({
      next: (_) => {
        this.toastService.success("Marks set");
        this.AssignmentResponses.update(asr => asr.filter(e => e._id !== result._id));
      },
      error: (_) => {
        this.toastService.warning("Problem while submitting marks");
      }
    })
  }

  downloadStudentDocument(result: AssignmentsResult) {
    const courseId = this.assignmentForm.get('courseId')?.value;
    if (!result.file || !courseId) return;

    this.assignmentService.downloadAssignmentInstructor(courseId, result.file).subscribe({
      next: (blob: Blob) => {

        const downloadUrl = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${result.student.name}_submission.pdf`;


        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      },
      error: (err) => {
        console.error('Download failed', err);
        this.toastService.error("Failed to download file.");
      }
    });


  }

  viewResponse(assignment: any) {
    this.viewResponses = !this.viewResponses;
    this.assignmentService.searchResult(assignment.course, assignment._id).subscribe(
      {
        next: (result) => {
          this.AssignmentResponses.set(result.result);
          this.maximumMarks.set(assignment.totalMarks);
        },
        error: (_) => {
          this.toastService.error("No assignment Found");
        }
      }
    )

  }

}
