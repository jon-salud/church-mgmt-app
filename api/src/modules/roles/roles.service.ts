import { Inject, Injectable } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../datastore';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { DeleteRoleDto } from './dto/delete-role.dto';

@Injectable()
export class RolesService {
  constructor(@Inject(DATA_STORE) private readonly db: DataStore) {}

  list() {
    return this.db.listRoles();
  }

  create(input: CreateRoleDto, actorUserId?: string) {
    return this.db.createRole({ ...input, actorUserId: actorUserId ?? 'system' });
  }

  update(id: string, input: UpdateRoleDto, actorUserId?: string) {
    return this.db.updateRole(id, { ...input, actorUserId: actorUserId ?? 'system' });
  }

  delete(id: string, input: DeleteRoleDto, actorUserId?: string) {
    return this.db.deleteRole(id, { ...input, actorUserId: actorUserId ?? 'system' });
  }
}
