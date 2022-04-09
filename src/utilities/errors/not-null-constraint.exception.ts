export class NotNullConstraintException extends Error {
  constructor(propertyName: string) {
    super(propertyName + ' cannot be null');
    Object.setPrototypeOf(this, NotNullConstraintException.prototype);
  }
}
