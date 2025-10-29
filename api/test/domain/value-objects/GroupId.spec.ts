import { GroupId } from '../../../src/domain/value-objects/GroupId';

describe('GroupId', () => {
  it('should create a valid GroupId', () => {
    const id = 'group-worship';
    const groupId = GroupId.create(id);
    expect(groupId.value).toBe(id);
  });

  it('should throw an error for empty string', () => {
    expect(() => GroupId.create('')).toThrow('GroupId must be a non-empty string');
  });

  it('should throw an error for non-string value', () => {
    expect(() => GroupId.create(null as any)).toThrow('GroupId must be a non-empty string');
  });

  it('should be equal to another GroupId with the same value', () => {
    const id = 'group-worship';
    const groupId1 = GroupId.create(id);
    const groupId2 = GroupId.create(id);
    expect(groupId1.equals(groupId2)).toBe(true);
  });

  it('should not be equal to another GroupId with different value', () => {
    const groupId1 = GroupId.create('group-worship');
    const groupId2 = GroupId.create('group-kids');
    expect(groupId1.equals(groupId2)).toBe(false);
  });
});
