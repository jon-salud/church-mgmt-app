import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async list(q?: string) {
    return this.prisma.user.findMany({
      where: q ? { OR: [{ primaryEmail: { contains: q, mode: 'insensitive' } }, { profile: { OR: [{ firstName: { contains: q, mode: 'insensitive' } }, { lastName: { contains: q, mode: 'insensitive' } }] } }] } : undefined,
      include: { profile: true },
      take: 50,
    });
  }

  async get(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  }
}
