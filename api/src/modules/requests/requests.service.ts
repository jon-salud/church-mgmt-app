import { Injectable, Inject } from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { DATA_STORE, DataStore } from '../../datastore';
import { User } from '../../types';

@Injectable()
export class RequestsService {
  constructor(@Inject(DATA_STORE) private readonly datastore: DataStore) {}

  async create(createRequestDto: CreateRequestDto, user: User) {
    // Create the request using the datastore method
    const newRequest = await this.datastore.createRequest(
      {
        userId: user.id,
        requestTypeId: createRequestDto.requestTypeId,
        title: createRequestDto.title,
        body: createRequestDto.body,
        isConfidential: createRequestDto.isConfidential ?? false,
        status: 'Pending',
      },
      user.id // actorUserId
    );

    return newRequest;
  }

  async findAll() {
    return this.datastore.getRequests();
  }
}
