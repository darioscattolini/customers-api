import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable } from 'rxjs';
import { NotNullConstraintException } from './not-null-constraint.exception';

/**
 * Catches any NotNullConstraintException and throws appropriate HTTP Bad
 * Request exception that is received by API user.
 */
@Injectable()
export class NullInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof NotNullConstraintException) {
          throw new BadRequestException(error.message);
        } else {
          throw error;
        }
      }),
    );
  }
}
