
import { Injectable } from '@nestjs/common';
import { MockDatabaseService } from '../../mock/mock-database.service';

@Injectable()
export class SettingsService {
  constructor(private readonly db: MockDatabaseService) {}

  getRequestTypes(churchId: string) {
    return this.db.listRequestTypes(churchId);
  }

  createRequestType(name: string, hasConfidentialField: boolean, actorUserId: string, description?: string) {
    return this.db.createRequestType(name, hasConfidentialField, actorUserId, description);
  }

  updateRequestType(id: string, name: string, actorUserId: string) {
    return this.db.updateRequestType(id, name, actorUserId);
  }

  archiveRequestType(id: string, actorUserId: string) {
    return this.db.archiveRequestType(id, actorUserId);
  }

  updateRequestTypeStatus(id: string, status: 'active' | 'archived', actorUserId: string) {
    return this.db.updateRequestTypeStatus(id, status, actorUserId);
  }

  reorderRequestTypes(ids: string[], actorUserId: string) {
    return this.db.reorderRequestTypes(ids, actorUserId);
  }
}
