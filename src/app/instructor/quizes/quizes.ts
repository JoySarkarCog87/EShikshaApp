import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CourseService } from '../../services/course-service';
import { map } from 'rxjs';
import { QuizService } from '../../services/quiz-service';
import { ToastrService } from 'ngx-toastr';
import { Quiz } from '../../models/quiz';

@Component({
  selector: 'app-quizes',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './quizes.html',
  styleUrl: './quizes.css',
})
export class Quizes {
  private courseService = inject(CourseService);
  private quizService = inject(QuizService);
  private toastService = inject(ToastrService);

  quizForm!: FormGroup;
  quizList = signal<Quiz[]>([]);
  isEditing = false;
  editingQuizId: string|null = null;
  selectedQuiz: any = null; 

  fb=inject(FormBuilder)

  instructorCourses = signal<{ id: string, title: string, category:string }[]>([]);

  ngOnInit(): void {
    this.courseService.instructorCoursesList$
      .subscribe(courses => {
        if (courses) {
          this.instructorCourses.set(courses)
        }
      })

    this.initForm();
    this.addQuestion();
  }

  initForm() {
    this.quizForm = this.fb.group({
      courseId: ['', Validators.required],
      title: ['', Validators.required],
      markPerQuestion: [null, [Validators.required, Validators.min(1)]],
      timeLimit: [null, [Validators.required, Validators.min(1)]],
      questions: this.fb.array([])
    });
  }

  get questions() {
    return this.quizForm.get('questions') as FormArray;
  }

  getOptionsArray(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('options') as FormArray;
  }

  addQuestion() {
    const qGroup = this.fb.group({
      questionText: ['', Validators.required],
      options: this.fb.array([
        ['', Validators.required],
        ['', Validators.required],
        ['', Validators.required],
        ['', Validators.required]
      ]),
      answer: ['', Validators.required]
    });

    this.questions.push(qGroup);
  }

  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }

  saveQuiz() {
    if (this.quizForm.invalid) return;
    this.quizForm.value.questions = this.modifyQuestions(this.quizForm.value.questions);
    const {courseId, ...quizData} = this.quizForm.value;
    if (this.isEditing && this.editingQuizId !== null) {
      this.quizService.updateQuiz(courseId, this.editingQuizId, quizData).subscribe({
        next:res=>{
          this.quizList.update(qarr=>qarr.map(q=>{
            console.log(q._id, this.editingQuizId);
            if(q?._id==res.result._id) return res.result;
            return q;
          }))
          this.isEditing = false;
          this.editingQuizId = null;
          this.toastService.success(res.message);
        },
        error:err=>{
          this.toastService.error(err?.error?.message||"Internal server error");
        }
      })
    } else {
      this.quizService.addQuiz(courseId, quizData).subscribe({
        next:res=>{
          this.quizList.update(qarr=>[res.result,...qarr]);
          this.toastService.success(res.message);
        },
        error:err=>{
          this.toastService.error(err?.error?.message||"Internal server Error");
        }
      })
      
    }

    const currentCourse = this.quizForm.get('courseId')?.value;
    this.resetForm();
    this.quizForm.patchValue({ courseId: currentCourse });
  }

  modifyQuestions(qestions:any[]){
    return qestions.map(q=>{
      q.answer = q.options[Number(q.answer)];
      return q;
    })
  }

  editQuiz(index:number, quizId:string) {
    this.isEditing = true;
    this.editingQuizId = quizId;
    const quiz = this.quizList()[index];
    this.questions.clear();
    let qGroup ;
    quiz.questions.forEach((q: any) => {
      qGroup = this.fb.group({
        questionText:q.questionText,
        options:this.fb.array([...q.options]),
        answer:String(q.options.findIndex((opt:string)=>opt===q.answer))
      })
      this.questions.push(qGroup);
    });

    this.quizForm.patchValue({
      title: quiz.title,
      markPerQuestion: (quiz.totalMarks/quiz?.questions?.length),
      timeLimit: quiz.timeLimit
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteQuiz(quizId:string) {
    if (confirm('Are you sure you want to delete this quiz?')) {
      this.quizService.deleteQuiz(this.quizForm.get('courseId')?.value??"", quizId).subscribe({
        next:res=>{
          this.toastService.success(res.message);
          this.quizList.set(this.quizList().filter(q=>q._id!==quizId));
        },
        error:err=>{
          this.toastService.error(err?.error?.message||"Something went wrong");
        }
      })
    }
  }
  
  viewQuiz(quiz: any) {
    this.selectedQuiz = quiz;
  }

  resetForm() {
    this.isEditing = false;
    this.editingQuizId = null;
    this.quizForm.reset();
    this.questions.clear();
    this.addQuestion();
  }

  getCurrentDate(): string {
    
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = (today.getDate()+3).toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  getQuizesByCourseId(event:any){
    console.log(event.target.value);
    this.quizService.getQuizes(event.target.value).subscribe({
      next:res=>{
        this.quizList.set(res.result);
      },
      error:err=>{
        console.log(err);
      }
    })
  }
}
