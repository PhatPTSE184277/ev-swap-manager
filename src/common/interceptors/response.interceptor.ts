/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces';

export interface Response<T> {
    data: T;
}

@Injectable()
export class TransformInterceptor<T>
    implements NestInterceptor<T, ApiResponse<T>>
{
    private getDefaultMessage(method: string): string {
        switch (method) {
            case 'POST':
                return 'Tạo mới thành công';
            case 'PUT':
                return 'Cập nhật thành công';
            case 'DELETE':
                return 'Xóa thành công';
            case 'GET':
                return 'Lấy dữ liệu thành công';
            default:
                return 'Yêu cầu thành công';
        }
    }

    intercept(
        context: ExecutionContext,
        next: CallHandler
    ): Observable<ApiResponse<T>> {
        const request = context.switchToHttp().getRequest();
        return next.handle().pipe(
            map((data) => {
                if (data && typeof data === 'object' && 'success' in data) {
                    return data as ApiResponse<T>;
                }
                let finalMessage = this.getDefaultMessage(request.method);
                if (data && typeof data === 'object' && 'message' in data) {
                    finalMessage = data.message;
                    
                    const { message, ...rest } = data;
                    data = Object.keys(rest).length > 0 ? (rest as T) : undefined;
                }
                if (data && typeof data === 'object' && 'data' in data) {
                    data = data.data as T;
                }
                return {
                    success: true,
                    message: finalMessage,
                    data
                };
            })
        );
    }
}
