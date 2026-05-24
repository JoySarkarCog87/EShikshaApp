export class Quiz{
    constructor(
        public title:string,
        public timeLimit:number,
        public totalMarks:number,
        public questions:{
            _id?:string,
            questionText:string,
            options:[string],
            answer?:string
        }[],
        public _id?:string,
        public course?:{
            title:string
        },
        public instructor?:{
            _id:string,
            name:string,
        }
    ){}
}