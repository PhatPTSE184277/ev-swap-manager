export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    // date?: Date;
    // path?: string;
    //takeTime --> middleware
}