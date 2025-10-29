import { ChurchId } from '../../../src/domain/value-objects/ChurchId';

describe('ChurchId', () => {
  it('should create a valid ChurchId', () => {
    const id = 'church-acc';
    const churchId = ChurchId.create(id);
    expect(churchId.value).toBe(id);
  });

  it('should throw an error for empty string', () => {
    expect(() => ChurchId.create('')).toThrow('ChurchId must be a non-empty string');
  });

  it('should throw an error for non-string value', () => {
    expect(() => ChurchId.create(null as any)).toThrow('ChurchId must be a non-empty string');
  });

  it('should be equal to another ChurchId with the same value', () => {
    const id = 'church-acc';
    const churchId1 = ChurchId.create(id);
    const churchId2 = ChurchId.create(id);
    expect(churchId1.equals(churchId2)).toBe(true);
  });

  it('should not be equal to another ChurchId with different value', () => {
    const churchId1 = ChurchId.create('church-acc');
    const churchId2 = ChurchId.create('church-other');
    expect(churchId1.equals(churchId2)).toBe(false);
  });
});
