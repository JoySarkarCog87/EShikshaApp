import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuizService } from '../../services/quiz-service';
import { ActivatedRoute, Router } from '@angular/router';
import { Quiz } from '../../models/quiz';
import { QuizResponse } from '../../models/quizResponse';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-student-quizes',
  imports: [FormsModule,CommonModule],
  templateUrl: './student-quizes.html',
  styleUrl: './student-quizes.css',
})
export class StudentQuizes {
  private quizService = inject(QuizService);
  private activatedRouter = inject(ActivatedRoute);
  private toastService = inject(ToastrService);
  private router = inject(Router);

  quizData = signal<Quiz|null>(null);
  isQuizStarted = signal<boolean>(false);
  isQuizSubmitted = signal<boolean>(false);
  totalTime = signal<number>(0);
  studentAnswers:{question:string,answer:string}[] = [];
  seconds = signal<number>(0);
  result = signal<QuizResponse|null>(null);
  timerId = 0;
  courseId = "";
  quizId = "";

  ngOnInit(){
    this.courseId = this.activatedRouter.snapshot.params['courseId'];
    this.quizId = this.activatedRouter.snapshot.params['id'];
    this.quizService.getQuizById(this.courseId, this.quizId).subscribe({
      next:res=>{
        this.quizData.set(res.result);
        this.totalTime.set(res.result.timeLimit);
      },
      error:err=>{
        console.log(err);
      }
    })
  }

  startQuiz() {
    this.isQuizStarted.set(true);
    this.timerId = this.startTimer();
  }

  startTimer(){
    const timerId = setInterval(()=>{
      if(this.seconds()==0){
        this.totalTime.update(t=>--t);
        this.seconds.set(59);
      }else{
        this.seconds.update(s=>--s);
      }
      if(this.totalTime()===0 && this.seconds()===0){
        this.stopTimer(timerId);
        this.submitQuiz();
      }
    },1000);
    return timerId;
  }

  goToHome() {
    this.router.navigateByUrl("/dashboard");
  }

  stopTimer = (timerId:number)=>{
    clearInterval(timerId);
  }



  getTimer(){
    let hour = Math.floor(this.totalTime()/60);
    let minute = Math.floor(this.totalTime()%60);
    return `${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}:${String(this.seconds()).padStart(2,'0')}`;
  }

  submitQuiz() {
    this.stopTimer(this.timerId);
    const time = ((this.quizData()?.timeLimit??0)*60)-((this.totalTime()*60)+this.seconds())
    const timeTaken = `${String(Math.floor(time/(60*60))).padStart(2, '0')}:${String(Math.floor(time/60)).padStart(2, '0')}:${String(time%60).padStart(2,'0')}`
    const quizData = new QuizResponse(this.quizData()?.instructor?._id??"", this.studentAnswers, timeTaken);
    this.quizService.submitQuizResponse(this.courseId, this.quizId, quizData).subscribe({
      next:res=>{
        this.result.set(res.result);
        this.toastService.success(res.message);
        console.log(res.result);
      },
      error:err=>{
        this.toastService.error(err.error.message||"Internal server error");
      }
    })
    this.isQuizSubmitted.set(true);
  }

  getMarksPercentage(){
    const marks = this.result()?.obtainMarks??0;
    const total = this.quizData()?.totalMarks??1;
    return ((marks/ total) * 100);
  }

}
