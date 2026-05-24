export class Assignments{
    constructor(
        public title:string,
        public dueDate:Date,
        public totalMarks:number,
        public courseId:number,
        public file:string,
        public _id:string
    ){}
}