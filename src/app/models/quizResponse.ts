type answerType = {
    question: string,
    answer: string
}


export class QuizResponse{
    constructor(
        public instructor: string,
        public answers: answerType[],
        public timeTaken: string,
        public obtainMarks?:number
    ){}
}