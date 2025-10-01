/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger
} from '@nestjs/common';
import e, { Request, Response } from 'express';
import { ApiResponse } from '../interfaces';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionFilter.name);
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status: number;
        let message: string;
        let error: any;

        if (exception instanceof HttpException) {
            // Khi lỗi có chủ đich (biết trước - lỗi http)
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (
                typeof exceptionResponse === 'object' &&
                exceptionResponse !== null
            ) {
                const exceptionResponseObj = exceptionResponse as Record<
                    string,
                    any
                >;
                message =
                    exceptionResponseObj.message ||
                    exceptionResponseObj.error ||
                    'Lỗi không xác định';

                //Lỗi validate DTO
                if (Array.isArray(exceptionResponseObj.message)) {
                    message = 'Dữ liệu không hợp lệ';
                    error = exceptionResponseObj.message;
                }
            } else {
                message = 'Lỗi không xác định';
            }

            if (status === Number(HttpStatus.UNAUTHORIZED)) {
                message = 'Người dùng chưa đăng nhập hoặc token không hợp lệ';
            }
            if (status === Number(HttpStatus.FORBIDDEN)) {
                message = 'Người dùng không có quyền truy cập chức năng này';
            }
        } else {
            // Lỗi không mong muốn (không biết trước - lỗi hệ thống)
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Lỗi hệ thống, vui lòng thử lại sau';
            this.logger.error(exception);
        }

        const errorResponse: ApiResponse<any> = {
            success: false,
            message,
            ...(error && { error })
        };

        response.status(status).json(errorResponse);
    }
}
