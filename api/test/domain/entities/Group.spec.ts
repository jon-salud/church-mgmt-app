import { Group } from '../../../src/domain/entities/Group';
import { GroupId } from '../../../src/domain/value-objects/GroupId';
import { ChurchId } from '../../../src/domain/value-objects/ChurchId';
import { UserId } from '../../../src/domain/value-objects/UserId';

describe('Group', () => {
  const groupId = GroupId.create('550e8400-e29b-41d4-a716-446655440000');
  const churchId = ChurchId.create('650e8400-e29b-41d4-a716-446655440000');
  const leaderId = UserId.create('750e8400-e29b-41d4-a716-446655440000');
  const createdAt = new Date('2023-01-01T00:00:00Z');

  it('should create a Group with valid data', () => {
    const group = Group.create({
      id: groupId,
      name: 'Worship Team',
      churchId,
      leaderId,
      createdAt,
      description: 'Leading worship services',
    });

    expect(group.id).toEqual(groupId);
    expect(group.name).toBe('Worship Team');
    expect(group.churchId).toEqual(churchId);
    expect(group.leaderId).toEqual(leaderId);
    expect(group.createdAt).toEqual(createdAt);
    expect(group.description).toBe('Leading worship services');
    expect(group.deletedAt).toBeUndefined();
  });

  it('should validate required fields in factory', () => {
    expect(() =>
      Group.create({
        id: groupId,
        name: '',
        churchId,
        leaderId,
        createdAt,
      })
    ).toThrow('Name is required');
  });

  it('should handle soft delete', () => {
    const group = Group.create({
      id: groupId,
      name: 'Worship Team',
      churchId,
      leaderId,
      createdAt,
    });

    expect(group.isDeleted()).toBe(false);

    const deletedGroup = group.markAsDeleted();
    expect(deletedGroup.isDeleted()).toBe(true);
    expect(deletedGroup.deletedAt).toBeInstanceOf(Date);
  });
});
