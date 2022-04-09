import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

/**
 * Facade to simplify and have control of the interface of built-in exceptions
 * arising from class-validator dependency.
 * @param errors
 * @returns
 */
export const classValidatorExceptionFactory = (
  errors: ValidationError[],
): BadRequestException => {
  return new BadRequestException({
    statusCode: 400,
    error: 'Bad Request',
    message: errors.map((error) => {
      let message = '';
      const property = error.property;
      const constraints = Object.keys(error.constraints);

      for (let i = 0; i < constraints.length; i++) {
        const constraint = constraints[i];
        message += i > 0 ? ' // ' : ''; // separator

        switch (constraint) {
          case 'isNotEmpty':
            message += property + ' should not be an empty string';
            break;
          case 'isDefined':
            message += property + ' should not be omitted, undefined or null';
            break;
          case 'isString':
            message += property + ' must be a string';
            break;
          case 'isEmail':
            message += property + ' property must contain a valid email';
            break;
          default:
            message += error.constraints[constraint];
        }
      }

      return message;
    }),
  });
};
