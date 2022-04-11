/**
 * Custom exception thrown after database not null error (attempt to store no
 * value in field required to be not null).
 */
export class NotNullConstraintException extends Error {
  constructor(propertyName: string) {
    super(propertyName + ' cannot be null');
    Object.setPrototypeOf(this, NotNullConstraintException.prototype);
  }
}
