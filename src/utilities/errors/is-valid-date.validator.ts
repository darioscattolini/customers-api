import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

@ValidatorConstraint({ name: 'isValidDate', async: false })
class IsValidDateConstraint implements ValidatorConstraintInterface {
  public validate(value: string) {
    return dayjs(value, 'YYYY-MM-DD', true).isValid();
  }

  public defaultMessage() {
    return '$property should have a valid date in YYYY-MM-DD format';
  }
}

/**
 * Checks that date strings match the YYYY-MM-DD or YYYY-D-M formats and that
 * the provided date actually exists.
 */
export function IsValidDate(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isValidDate',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: IsValidDateConstraint,
    });
  };
}
