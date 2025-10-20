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

  async initiateCheckin(data: InitiateCheckinDto) {
    // Implementation to be added
  }

  async confirmCheckin(data: ConfirmCheckinDto) {
    // Implementation to be added
  }

  async initiateCheckout(data: InitiateCheckoutDto) {
    // Implementation to be added
    this.notificationsService.sendNotification('userId', {
      title: 'Child Checked Out',
      body: 'Your child has been checked out. Please confirm.',
    });
  }

  async confirmCheckout(data: ConfirmCheckoutDto) {
    // Implementation to be added
  }
}
