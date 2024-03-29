import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable } from 'rxjs';
import { UniqueConstraintException } from './unique-constraint.exception';

/**
 * Catches any UniqueConstraintException and throws appropriate HTTP Bad Request
 * exception that is received by API user.
 */
@Injectable()
export class NotUniqueInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof UniqueConstraintException) {
          throw new BadRequestException(error.message);
        } else {
          throw error;
        }
      }),
    );
  }
}
