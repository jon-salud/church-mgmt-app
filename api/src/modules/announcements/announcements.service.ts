import { Inject, Injectable } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../datastore';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

@Injectable()
export class AnnouncementsService {
  constructor(@Inject(DATA_STORE) private readonly db: DataStore) {}

  async list() {
    const church = await this.db.getChurch();
    return this.db.listAnnouncements(church.id);
  }

  markRead(announcementId: string, userId: string) {
    return this.db.markAnnouncementRead(announcementId, userId);
  }

  create(input: CreateAnnouncementDto, actorUserId: string) {
    const publishAt = input.publishAt ?? new Date().toISOString();
    const payload = {
      title: input.title,
      body: input.body,
      audience: input.audience,
      groupIds: input.audience === 'custom' ? input.groupIds ?? [] : undefined,
      publishAt,
      expireAt: input.expireAt,
      actorUserId,
    };
    return this.db.createAnnouncement(payload);
  }

  update(id: string, input: UpdateAnnouncementDto, actorUserId: string) {
    const payload: Record<string, unknown> = {
      ...input,
      actorUserId,
    };

    if (input.audience) {
      if (input.audience !== 'custom') {
        payload.groupIds = undefined;
      } else if (input.groupIds !== undefined) {
        payload.groupIds = input.groupIds;
      }
    } else if (input.groupIds !== undefined) {
      payload.groupIds = input.groupIds;
    }

    if (input.publishAt === undefined) {
      delete payload.publishAt;
    }
    if (input.expireAt === undefined) {
      delete payload.expireAt;
    }

    return this.db.updateAnnouncement(id, payload as any);
  }
}
