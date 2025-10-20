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
    private readonly notificationsService: NotificationsService,
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

  async initiateCheckin(data: InitiateCheckinDto, actorUserId: string) {
    const checkins = [];
    for (const childId of data.childIds) {
      const checkin = await this.db.createCheckin({
        eventId: data.eventId,
        childId,
        actorUserId,
      });
      checkins.push(checkin);
    }
    return checkins;
  }

  async confirmCheckin(data: ConfirmCheckinDto, actorUserId: string) {
    return this.db.updateCheckin(data.checkinId, {
      status: 'checked-in',
      checkinTime: new Date().toISOString(),
      checkedInBy: actorUserId,
      actorUserId,
    });
  }

  async initiateCheckout(data: InitiateCheckoutDto, actorUserId: string) {
    const checkinRecord = await this.db.getCheckinById(data.checkinId);

    if (!checkinRecord || !checkinRecord.child) {
      return null;
    }

    const { child } = checkinRecord;
    const members = await this.db.getHouseholdMembers(child.householdId);
    const parents = members.filter((m: any) => m.profile?.householdRole === 'Head');

    for (const parent of parents) {
      this.notificationsService.sendNotification(parent.id, {
        title: 'Child Checked Out',
        body: `${child.fullName} has been checked out.`,
      });
    }

    return this.db.updateCheckin(data.checkinId, {
      status: 'checked-out',
      checkoutTime: new Date().toISOString(),
      checkedOutBy: actorUserId,
      actorUserId,
    });
  }

  async confirmCheckout(data: ConfirmCheckoutDto, actorUserId: string) {
    const checkin = await this.db.getCheckinById(data.checkinId);

    if (!checkin || !checkin.checkedOutBy || !checkin.child) {
      // Or throw an error, depending on desired behavior
      return null;
    }

    // Optional: Add logic here to verify that actorUserId is an authorized guardian.

    const staffMemberId = checkin.checkedOutBy;
    const parent = await this.db.getUserById(actorUserId);
    const parentName = parent?.profile ? `${parent.profile.firstName} ${parent.profile.lastName}` : 'A parent';

    this.notificationsService.sendNotification(staffMemberId, {
      title: 'Checkout Confirmed',
      body: `${parentName} has confirmed the checkout of ${checkin.child.fullName}.`,
    });

    return checkin;
  }
}
