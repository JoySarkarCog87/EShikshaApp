export class EnrolledCourse{
    constructor(
        public _id: string,
        public course: {
            _id: string,
            title: string,
            category: string,
            instructor: {
                _id: string,
                name: string
            },
            imageUrl: string
        },
        public attendedAssignments: string[],
        public attendedQuizes: string[],
        public completePercentage: number
    ){}
}