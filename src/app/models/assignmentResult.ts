export class AssignmentsResult{
    constructor(
        public _id:string,
        public course:string,
        public student:{
            email:string,
            name:string,
        },
        public file:string    
    ){}
}