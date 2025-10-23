
import { Injectable, Inject } from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { DATA_STORE, DataStore } from '../../datastore';
import { User } from '../../types';
import { randomUUID } from 'node:crypto';

@Injectable()
export class RequestsService {
  constructor(@Inject(DATA_STORE) private readonly datastore: DataStore) {}

  async create(createRequestDto: CreateRequestDto, user: User) {
    const newRequest = {
      id: `req-${randomUUID()}`,
      churchId: user.churchId,
      userId: user.id,
      ...createRequestDto,
      isConfidential: createRequestDto.isConfidential ?? false,
      createdAt: new Date().toISOString(),
    };
    // This is a mock implementation. In a real scenario, you would save to a database.
    // For now, we'll just return the created object.
    return newRequest;
  }

  async findAll() {
    return this.datastore.getRequests();
  }
}
