import { Injectable, Inject } from '@nestjs/common';
import { HOUSEHOLDS_REPOSITORY, IHouseholdsRepository } from './households.repository.interface';
import { BulkArchiveHouseholdsDto, BulkRestoreHouseholdsDto } from './dto/bulk-operations.dto';

@Injectable()
export class HouseholdsService {
  constructor(
    @Inject(HOUSEHOLDS_REPOSITORY)
    private readonly householdsRepository: IHouseholdsRepository
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
}
