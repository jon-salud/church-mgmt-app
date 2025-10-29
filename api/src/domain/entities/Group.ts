import { GroupId } from '../value-objects/GroupId';
import { ChurchId } from '../value-objects/ChurchId';
import { UserId } from '../value-objects/UserId';

export interface GroupProps {
  id: GroupId;
  name: string;
  churchId: ChurchId;
  leaderId?: UserId;
  createdAt: Date;
  description?: string;
  type?: string;
  meetingDay?: string;
  meetingTime?: string;
  tags?: readonly string[];
  deletedAt?: Date;
}

export class Group {
  readonly id: GroupId;
  readonly name: string;
  readonly churchId: ChurchId;
  readonly leaderId?: UserId;
  readonly createdAt: Date;
  readonly description?: string;
  readonly type?: string;
  readonly meetingDay?: string;
  readonly meetingTime?: string;
  readonly tags?: readonly string[];
  readonly deletedAt?: Date;

  private constructor(props: GroupProps) {
    this.id = props.id;
    this.name = props.name;
    this.churchId = props.churchId;
    this.leaderId = props.leaderId;
    this.createdAt = props.createdAt;
    this.description = props.description;
    this.type = props.type;
    this.meetingDay = props.meetingDay;
    this.meetingTime = props.meetingTime;
    this.tags = props.tags ? Object.freeze([...props.tags]) : undefined;
    this.deletedAt = props.deletedAt;
  }

  static create(props: Omit<GroupProps, 'deletedAt'>): Group {
    if (!props.name.trim()) {
      throw new Error('Name is required');
    }
    return new Group(props);
  }

  static reconstruct(props: GroupProps): Group {
    return new Group(props);
  }

  isDeleted(): boolean {
    return this.deletedAt !== undefined;
  }

  markAsDeleted(): Group {
    return new Group({
      ...this,
      deletedAt: new Date(),
    });
  }
}
