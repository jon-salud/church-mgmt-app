import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const church = await prisma.church.upsert({
    where: { id: 'seed-church' },
    update: {},
    create: { id: 'seed-church', name: 'Auckland Community Church' },
  });

  const user = await prisma.user.upsert({
    where: { primaryEmail: 'admin@example.com' },
    update: {},
    create: { primaryEmail: 'admin@example.com', profile: { create: { firstName: 'Admin', lastName: 'User' } } },
  });

  await prisma.churchUser.upsert({
    where: { churchId_userId: { churchId: church.id, userId: user.id } },
    update: { role: 'Admin' },
    create: { churchId: church.id, userId: user.id, role: 'Admin' },
  });

  const group = await prisma.group.create({
    data: { churchId: church.id, name: 'Worship Team', description: 'Sunday service music team', type: 'ServiceMinistry' as any },
  });

  await prisma.groupMember.create({
    data: { groupId: group.id, userId: user.id, role: 'Leader' as any },
  });

  const event = await prisma.event.create({
    data: {
      churchId: church.id,
      title: 'Sunday Service',
      startAt: new Date(Date.now() + 3 * 24 * 3600 * 1000),
      endAt: new Date(Date.now() + 3 * 24 * 3600 * 1000 + 2 * 3600 * 1000),
      location: 'Main Hall',
      visibility: 'public',
    },
  });

  await prisma.attendance.create({
    data: { eventId: event.id, userId: user.id, status: 'checkedIn' },
  });

  await prisma.fund.create({ data: { churchId: church.id, name: 'General' } });

  await prisma.announcement.create({
    data: { churchId: church.id, title: 'Welcome!', body: 'We are live with our new system 🎉', audience: 'all' },
  });
}

main()
  .then(() => console.log('Seed completed'))
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
