/**
 * Custom exception thrown after database unique constraint error (attempt to
 * store value used by another entity in field required to be unique).
 */
export class UniqueConstraintException extends Error {
  constructor(entityName: string, fieldName: string, fieldValue: any) {
    super(
      `There is another ${entityName} with ${fieldName} set to ${fieldValue}`,
    );
    Object.setPrototypeOf(this, UniqueConstraintException.prototype);
  }
}
