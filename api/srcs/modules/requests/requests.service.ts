import { Injectable, Inject } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../datastore';
import { CreateRequestDto } from './dto/create-request.dto';
import { MockUser } from '../../mock/mock-data';
import { randomUUID } from 'node:crypto';

@Injectable()
export class RequestsService {
  constructor(@Inject(DATA_STORE) private readonly datastore: DataStore) {}

  async create(createRequestDto: CreateRequestDto, user: MockUser) {
    const newRequest = {
      userId: user.id,
      ...createRequestDto,
      isConfidential: createRequestDto.isConfidential ?? false,
    };

    return this.datastore.createRequest(newRequest, user.id);
  }

  async findAll() {
    return this.datastore.getRequests();
  }
}
