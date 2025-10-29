import { Group, GroupProps } from '../../../src/domain/entities/Group';
import { GroupId } from '../../../src/domain/value-objects/GroupId';
import { ChurchId } from '../../../src/domain/value-objects/ChurchId';
import { UserId } from '../../../src/domain/value-objects/UserId';
import { TestBuilder } from './base.builder';

/**
 * Builder for creating Group domain entities in tests
 */
export class GroupBuilder extends TestBuilder<Group> {
  constructor() {
    super();
    // Set defaults
    this.withData({
      id: GroupId.create('group-1'),
      name: 'Test Group',
      churchId: ChurchId.create('church-1'),
      createdAt: new Date('2025-01-01T00:00:00Z'),
    } as Partial<GroupProps>);
  }

  withId(id: string): this {
    return this.with('id', GroupId.create(id));
  }

  withChurchId(churchId: string): this {
    return this.with('churchId', ChurchId.create(churchId));
  }

  withName(name: string): this {
    return this.with('name', name);
  }

  withLeader(leaderId: string): this {
    return this.with('leaderId', UserId.create(leaderId));
  }

  withDescription(description: string): this {
    return this.with('description', description);
  }

  withType(type: string): this {
    return this.with('type', type);
  }

  withMeetingSchedule(day: string, time: string): this {
    return this.with('meetingDay', day).with('meetingTime', time);
  }

  withTags(tags: string[]): this {
    return this.with('tags', tags);
  }

  withCreatedAt(date: Date): this {
    return this.with('createdAt', date);
  }

  build(): Group {
    const props: GroupProps = {
      id: this.data.id!,
      name: this.data.name!,
      churchId: this.data.churchId!,
      leaderId: this.data.leaderId,
      createdAt: this.data.createdAt!,
      description: this.data.description,
      type: this.data.type,
      meetingDay: this.data.meetingDay,
      meetingTime: this.data.meetingTime,
      tags: this.data.tags,
      deletedAt: this.data.deletedAt,
    };

    return Group.reconstruct(props);
  }

  clone(): GroupBuilder {
    const clone = new GroupBuilder();
    clone.data = { ...this.data };
    return clone;
  }
}

/**
 * Pre-configured group builders for common test scenarios
 */
export class GroupFixtures {
  static smallGroup(): GroupBuilder {
    return new GroupBuilder()
      .withId('small-group-1')
      .withName('Young Adults Small Group')
      .withDescription('A group for young adults to connect and grow spiritually')
      .withType('small-group')
      .withMeetingSchedule('Wednesday', '7:00 PM')
      .withTags(['young-adults', 'fellowship', 'bible-study']);
  }

  static ministryTeam(): GroupBuilder {
    return new GroupBuilder()
      .withId('ministry-team-1')
      .withName('Worship Ministry Team')
      .withDescription('Planning and leading worship services')
      .withType('ministry')
      .withMeetingSchedule('Monday', '6:30 PM')
      .withTags(['worship', 'ministry', 'music']);
  }

  static withLeader(leaderId: string): GroupBuilder {
    return new GroupBuilder()
      .withId('group-with-leader')
      .withName('Led Group')
      .withLeader(leaderId);
  }
}
