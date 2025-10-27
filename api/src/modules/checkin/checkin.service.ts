import { Injectable, Inject } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../datastore';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';
import { InitiateCheckinDto } from './dto/initiate-checkin.dto';
import { ConfirmCheckinDto } from './dto/confirm-checkin.dto';
import { InitiateCheckoutDto } from './dto/initiate-checkout.dto';
import { ConfirmCheckoutDto } from './dto/confirm-checkout.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CheckinService {
  constructor(
    @Inject(DATA_STORE) private readonly db: DataStore,
    private readonly notificationsService: NotificationsService
  ) {}

  async createChild(data: CreateChildDto, actorUserId: string) {
    return this.db.createChild({ ...data, actorUserId });
  }

  async getChildren(householdId: string) {
    return this.db.getChildren(householdId);
  }

  async updateChild(id: string, data: UpdateChildDto, actorUserId: string) {
    return this.db.updateChild(id, { ...data, actorUserId });
  }

  async deleteChild(id: string, actorUserId: string) {
    return this.db.deleteChild(id, { actorUserId });
  }

  async getCheckinsByEventId(eventId: string) {
    return this.db.getCheckinsByEventId(eventId);
  }

  async getCheckins(status: 'pending' | 'checked-in') {
    return this.db.getCheckins(status);
  }

  async initiateCheckin(data: InitiateCheckinDto, actorUserId: string) {
    const checkins = await Promise.all(
      data.childIds.map(childId =>
        this.db.createCheckin({
          eventId: data.eventId,
          childId,
          actorUserId,
        })
      )
    );

    return checkins;
  }

  async confirmCheckin(data: ConfirmCheckinDto, actorUserId: string) {
    return this.db.updateCheckin(data.checkinId, {
      status: 'checked-in',
      checkinTime: new Date().toISOString(),
      actorUserId,
    });
  }

  async initiateCheckout(data: InitiateCheckoutDto, actorUserId: string) {
    const checkin = await this.db.getCheckinById(data.checkinId);

    if (checkin && checkin.child) {
      const children = await this.db.getChildren(checkin.child.householdId);
      const householdMembers = await this.db.getHouseholdMembers(checkin.child.householdId);
      const usersToNotify = householdMembers.filter(member =>
        children.some(child => child.householdId === member.profile.householdId)
      );
      for (const user of usersToNotify) {
        this.notificationsService.sendNotification(user.id, {
          title: 'Child Checked Out',
          body: `${checkin.child.fullName} has been checked out. Please confirm.`,
        });
      }
    }
    return this.db.updateCheckin(data.checkinId, {
      status: 'checked-out',
      checkoutTime: new Date().toISOString(),
      actorUserId,
    });
  }

  async confirmCheckout(_data: ConfirmCheckoutDto) {
    // Implementation to be added
  }
}
