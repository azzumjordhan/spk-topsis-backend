import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResponseInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((res: unknown) => this.responseHandler(res, context)),
      catchError((err: HttpException) =>
        throwError(() => this.errorHandler(err, context)),
      ),
    );
  }

  errorHandler(exception: HttpException, context: ExecutionContext) {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let errorData: string = 'INTERNAL_SERVER_ERROR';

    if (statusCode != HttpStatus.INTERNAL_SERVER_ERROR) {
      const errorDatas = exception.getResponse();

      if (typeof errorDatas === 'object') {
        errorData = Object(errorDatas)['error_code'];
      } else {
        errorData = errorDatas;
      }
    } else {
      this.logger.error(exception.message);
    }
    response.status(statusCode).json({
      status: false,
      httpStatus: errorData,
      httpStatusCode: statusCode,
      message: exception.message,
      data: null,
    });
  }

  responseHandler(res: any, context: ExecutionContext) {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    const statusCode = response?.statusCode;

    return {
      status: true,
      statusCode,
      data: res,
      message: response?.message,
    };
  }
}
