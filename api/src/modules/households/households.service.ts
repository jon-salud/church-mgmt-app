import { Injectable, Inject } from '@nestjs/common';
import { HOUSEHOLDS_REPOSITORY, IHouseholdsRepository } from './households.repository.interface';
import { BulkArchiveHouseholdsDto, BulkRestoreHouseholdsDto } from './dto/bulk-operations.dto';
import { CheckinService } from '../checkin/checkin.service';

@Injectable()
export class HouseholdsService {
  constructor(
    @Inject(HOUSEHOLDS_REPOSITORY)
    private readonly householdsRepository: IHouseholdsRepository,
    private readonly checkinService: CheckinService
  ) {}

  async findAll() {
    return this.householdsRepository.listHouseholds();
  }

  async findOne(id: string) {
    return this.householdsRepository.getHouseholdById(id);
  }

  async findAllDeleted() {
    return this.householdsRepository.listDeletedHouseholds();
  }

  async delete(id: string, actorUserId: string) {
    return this.householdsRepository.deleteHousehold(id, actorUserId);
  }

  async undelete(id: string, actorUserId: string) {
    return this.householdsRepository.undeleteHousehold(id, actorUserId);
  }

  async bulkDelete(dto: BulkArchiveHouseholdsDto, actorUserId: string) {
    return this.householdsRepository.bulkDeleteHouseholds(dto.householdIds, actorUserId);
  }

  async bulkUndelete(dto: BulkRestoreHouseholdsDto, actorUserId: string) {
    return this.householdsRepository.bulkUndeleteHouseholds(dto.householdIds, actorUserId);
  }

  async hardDelete(id: string, actorUserId: string) {
    return this.householdsRepository.hardDeleteHousehold(id, actorUserId);
  }

  async getDependents(id: string) {
    const household = await this.householdsRepository.getHouseholdById(id);
    const allChildren = await this.checkinService.getChildren(id);
    const activeChildren = allChildren.filter(child => !child.deletedAt);

    // Count active members (exclude deleted members)
    // Note: This assumes memberIds are all active; in production you'd filter deleted users
    const activeMemberCount = household.memberIds?.length || 0;

    return {
      activeMemberCount,
      activeChildrenCount: activeChildren.length,
      children: activeChildren,
    };
  }
}
