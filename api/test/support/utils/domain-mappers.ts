import { User, UserProps } from '../../../src/domain/entities/User';
import { Group, GroupProps } from '../../../src/domain/entities/Group';
import { Document } from '../../../src/domain/entities/Document';
import { UserId } from '../../../src/domain/value-objects/UserId';
import { Email } from '../../../src/domain/value-objects/Email';
import { ChurchId } from '../../../src/domain/value-objects/ChurchId';
import { GroupId } from '../../../src/domain/value-objects/GroupId';
import { DocumentId } from '../../../src/domain/value-objects/DocumentId';

/**
 * Shared domain mappers for converting mock data to domain entities in tests
 */
export class DomainMappers {
  static toDomainUser(mockUser: {
    id: string;
    primaryEmail: string;
    churchId: string;
    status: string;
    profile: { firstName: string; lastName: string; phone?: string };
    roles?: Array<{ churchId: string; roleId: string }>;
  }): User {
    return User.create({
      id: UserId.create(mockUser.id),
      primaryEmail: Email.create(mockUser.primaryEmail),
      churchId: ChurchId.create(mockUser.churchId),
      status: mockUser.status as 'active' | 'invited',
      createdAt: new Date(),
      roles: mockUser.roles || User.createDefaultRoles(ChurchId.create(mockUser.churchId)),
      profile: {
        ...mockUser.profile,
        householdId: '',
        householdRole: 'Head',
      },
    });
  }

  static toDomainGroup(mockGroup: {
    id: string;
    name: string;
    churchId: string;
    description?: string;
    type: string;
    meetingDay?: string;
    meetingTime?: string;
    tags?: string[];
    leaderId?: string;
  }): Group {
    return Group.create({
      id: GroupId.create(mockGroup.id),
      churchId: ChurchId.create(mockGroup.churchId),
      name: mockGroup.name,
      description: mockGroup.description,
      type: mockGroup.type,
      meetingDay: mockGroup.meetingDay,
      meetingTime: mockGroup.meetingTime,
      tags: mockGroup.tags || [],
      leaderId: mockGroup.leaderId ? UserId.create(mockGroup.leaderId) : undefined,
      createdAt: new Date(),
    });
  }

  static toDomainDocument(mockDoc: {
    id: string;
    churchId: string;
    uploaderProfileId: string;
    fileName: string;
    fileType: string;
    title: string;
    description?: string;
    storageKey: string;
    fileData: string;
    createdAt: Date;
    updatedAt: Date;
  }): Document {
    return Document.reconstruct({
      id: DocumentId.create(mockDoc.id),
      churchId: ChurchId.create(mockDoc.churchId),
      uploaderProfileId: UserId.create(mockDoc.uploaderProfileId),
      fileName: mockDoc.fileName,
      fileType: mockDoc.fileType,
      title: mockDoc.title,
      description: mockDoc.description,
      storageKey: mockDoc.storageKey,
      fileData: mockDoc.fileData,
      createdAt: mockDoc.createdAt,
      updatedAt: mockDoc.updatedAt,
    });
  }
}
