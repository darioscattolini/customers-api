export class UniqueConstraintException extends Error {
  constructor(entityName: string, fieldName: string, fieldValue: any) {
    super(
      `There is another ${entityName} with ${fieldName} set to ${fieldValue}`,
    );
    Object.setPrototypeOf(this, UniqueConstraintException.prototype);
  }
}
