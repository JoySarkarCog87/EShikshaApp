export class Course {
    constructor(
        public title: string,
        public category: string,
        public description: string,
        public imageUrl: string,
        public _id?: string,
        public enrolments?: number,
        public instructor?: {
            _id?: string;
            email?: string;
            name?: string;
        },
        public rating?: {
            totalUsers?: number;
            average?: {
                $numberDecimal?:number
            };
        },
        public feedback?: any[],
        public createdAt?: string,
        public updatedAt?: string,
        public enrolled?: number
    ) {}
}