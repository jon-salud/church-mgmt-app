import { Inject, Injectable } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../datastore';
import { CreatePastoralCareTicketDto } from './dto/create-pastoral-care-ticket.dto';
import { UpdatePastoralCareTicketDto } from './dto/update-pastoral-care-ticket.dto';
import { CreatePastoralCareCommentDto } from './dto/create-pastoral-care-comment.dto';

@Injectable()
export class PastoralCareService {
  constructor(@Inject(DATA_STORE) private readonly db: DataStore) {}

  async createTicket(input: CreatePastoralCareTicketDto, actorUserId: string) {
    const church = await this.db.getChurch();
    return this.db.createPastoralCareTicket({
      ...input,
      churchId: church.id,
      authorId: actorUserId,
      actorUserId,
    });
  }

  async updateTicket(id: string, input: UpdatePastoralCareTicketDto, actorUserId: string) {
    return this.db.updatePastoralCareTicket(id, { ...input, actorUserId });
  }

  async createComment(ticketId: string, input: CreatePastoralCareCommentDto, actorUserId: string) {
    return this.db.createPastoralCareComment({
      ...input,
      ticketId,
      authorId: actorUserId,
      actorUserId,
    });
  }

  async getTicket(id: string) {
    return this.db.getPastoralCareTicket(id);
  }

  async listTickets() {
    const church = await this.db.getChurch();
    return this.db.listPastoralCareTickets(church.id);
  }
}
