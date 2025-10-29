import { ChurchId } from '../../../src/domain/value-objects/ChurchId';
import { UserId } from '../../../src/domain/value-objects/UserId';
import { DocumentId } from '../../../src/domain/value-objects/DocumentId';
import { GroupId } from '../../../src/domain/value-objects/GroupId';
import { Email } from '../../../src/domain/value-objects/Email';

/**
 * Deep clones test data while preserving value object instances and Date objects.
 * This utility prevents JSON serialization issues that would lose object methods.
 */
export function deepCloneData(data: any): any {
  if (data === null || typeof data !== 'object') {
    return data;
  }

  if (data instanceof Date) {
    return new Date(data.getTime());
  }

  // Value objects - reconstruct with proper types
  if (data instanceof ChurchId) {
    return ChurchId.create(data.value);
  }
  if (data instanceof UserId) {
    return UserId.create(data.value);
  }
  if (data instanceof DocumentId) {
    return DocumentId.create(data.value);
  }
  if (data instanceof GroupId) {
    return GroupId.create(data.value);
  }
  if (data instanceof Email) {
    return Email.create(data.value);
  }

  if (Array.isArray(data)) {
    return data.map(item => deepCloneData(item));
  }

  if (typeof data === 'object') {
    const cloned: any = {};
    for (const key of Object.keys(data)) {
      cloned[key] = deepCloneData(data[key]);
    }
    return cloned;
  }

  return data;
}
