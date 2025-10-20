import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const now = new Date();
const daysFromNow = (offset: number, hour = 10) => {
  const date = new Date(now);
  date.setDate(date.getDate() + offset);
  date.setHours(hour, 0, 0, 0);
  return date;
};

async function main() {
  const churchId = 'church-acc';

  await prisma.church.upsert({
    where: { id: churchId },
    update: {},
    create: {
      id: churchId,
      name: 'Auckland Community Church',
      timezone: 'Pacific/Auckland',
      address: '12 Karaka Street, Auckland',
    },
  });

  const users = await Promise.all(
    [
      {
        primaryEmail: 'admin@example.com',
        firstName: 'Ariana',
        lastName: 'Matau',
        roles: ['Admin'],
      },
      {
        primaryEmail: 'leader@example.com',
        firstName: 'Sione',
        lastName: 'Latu',
        roles: ['Leader'],
      },
      {
        primaryEmail: 'member1@example.com',
        firstName: 'Maria',
        lastName: 'Taulagi',
        roles: ['Member'],
      },
      {
        primaryEmail: 'member2@example.com',
        firstName: 'Tomas',
        lastName: 'Perenise',
        roles: ['Member'],
      },
      {
        primaryEmail: 'member3@example.com',
        firstName: 'Lydia',
        lastName: 'Ngata',
        roles: ['Member'],
      },
      {
        primaryEmail: 'volunteer@example.com',
        firstName: 'Tevita',
        lastName: 'Manu',
        roles: ['Childcare Volunteer'],
      },
    ].map(async ({ primaryEmail, firstName, lastName, roles }) => {
      const user = await prisma.user.upsert({
        where: { primaryEmail },
        update: {},
        create: {
          primaryEmail,
          profile: {
            create: {
              firstName,
              lastName,
            },
          },
        },
        include: { profile: true },
      });

      await Promise.all(
        roles.map(role =>
          prisma.churchUser.upsert({
            where: { churchId_userId: { churchId, userId: user.id } },
            update: { role: role as any },
            create: { churchId, userId: user.id, role: role as any },
          }),
        ),
      );

      return user;
    }),
  );

  const userMap = new Map(users.map(user => [user.primaryEmail, user]));

  const worshipGroup = await prisma.group.upsert({
    where: { id: 'group-worship' },
    update: {},
    create: {
      id: 'group-worship',
      churchId,
      name: 'Worship Team',
      description: 'Sunday service music ministry',
      type: 'ServiceMinistry',
      meetingDay: 'Thursday',
      meetingTime: '19:00',
      tags: ['music', 'sunday'] as unknown as Prisma.JsonValue,
    },
  });

  const kidsGroup = await prisma.group.upsert({
    where: { id: 'group-kids' },
    update: {},
    create: {
      id: 'group-kids',
      churchId,
      name: 'Kids Connect',
      description: 'Primary-aged kids during Sunday service',
      type: 'ServiceMinistry',
      meetingDay: 'Sunday',
      meetingTime: '10:00',
      tags: ['kids', 'teaching'] as unknown as Prisma.JsonValue,
    },
  });

  await prisma.groupMember.upsert({
    where: { groupId_userId: { groupId: worshipGroup.id, userId: userMap.get('leader@example.com')!.id } },
    update: { role: 'Leader' },
    create: { groupId: worshipGroup.id, userId: userMap.get('leader@example.com')!.id, role: 'Leader' },
  });

  await prisma.groupMember.upsert({
    where: { groupId_userId: { groupId: worshipGroup.id, userId: userMap.get('member1@example.com')!.id } },
    update: { role: 'Member' },
    create: { groupId: worshipGroup.id, userId: userMap.get('member1@example.com')!.id, role: 'Member' },
  });

  await prisma.groupMember.upsert({
    where: { groupId_userId: { groupId: kidsGroup.id, userId: userMap.get('member3@example.com')!.id } },
    update: { role: 'Leader' },
    create: { groupId: kidsGroup.id, userId: userMap.get('member3@example.com')!.id, role: 'Leader' },
  });

  const sundayService = await prisma.event.upsert({
    where: { id: 'event-sunday-service' },
    update: {},
    create: {
      id: 'event-sunday-service',
      churchId,
      title: 'Sunday Service',
      description: 'Weekly gathering with worship and teaching.',
      startAt: daysFromNow(3, 10),
      endAt: daysFromNow(3, 12),
      location: 'Main Auditorium',
      visibility: 'public',
      groupId: worshipGroup.id,
    },
  });

  await prisma.attendance.upsert({
    where: { eventId_userId: { eventId: sundayService.id, userId: userMap.get('leader@example.com')!.id } },
    update: { status: 'checkedIn' },
    create: { eventId: sundayService.id, userId: userMap.get('leader@example.com')!.id, status: 'checkedIn' },
  });

  await prisma.attendance.upsert({
    where: { eventId_userId: { eventId: sundayService.id, userId: userMap.get('member1@example.com')!.id } },
    update: { status: 'checkedIn' },
    create: { eventId: sundayService.id, userId: userMap.get('member1@example.com')!.id, status: 'checkedIn' },
  });

  await prisma.event.upsert({
    where: { id: 'event-team-rehearsal' },
    update: {},
    create: {
      id: 'event-team-rehearsal',
      churchId,
      title: 'Worship Team Rehearsal',
      description: 'Weekly rehearsal for the worship ministry.',
      startAt: daysFromNow(2, 19),
      endAt: daysFromNow(2, 21),
      location: 'Music Room',
      visibility: 'private',
      groupId: worshipGroup.id,
    },
  });

  await prisma.fund.upsert({
    where: { id: 'fund-general' },
    update: {},
    create: { id: 'fund-general', churchId, name: 'General Offering' },
  });

  await prisma.fund.upsert({
    where: { id: 'fund-missions' },
    update: {},
    create: { id: 'fund-missions', churchId, name: 'Missions' },
  });

  await prisma.contribution.createMany({
    data: [
      {
        id: 'contribution-1',
        churchId,
        memberId: userMap.get('member1@example.com')!.id,
        amount: 120,
        date: daysFromNow(-12),
        method: 'bank-transfer',
        fundId: 'fund-general',
        note: 'Monthly pledge',
      },
      {
        id: 'contribution-2',
        churchId,
        memberId: userMap.get('member2@example.com')!.id,
        amount: 40,
        date: daysFromNow(-7),
        method: 'cash',
        fundId: 'fund-missions',
      },
    ],
    skipDuplicates: true,
  });

  await prisma.announcement.upsert({
    where: { id: 'announcement-welcome' },
    update: {},
    create: {
      id: 'announcement-welcome',
      churchId,
      title: 'Welcome to the new app!',
      body: 'We are excited to launch our new member portal. Please explore the features and share feedback.',
      audience: 'all',
      publishAt: daysFromNow(-2),
    },
  });

  await prisma.announcement.upsert({
    where: { id: 'announcement-fundraiser' },
    update: {},
    create: {
      id: 'announcement-fundraiser',
      churchId,
      title: 'Youth Missions Fundraiser',
      body: 'Youth ministry is hosting a bake sale fundraiser after the service this Sunday.',
      audience: 'custom',
      groupIds: [kidsGroup.id] as unknown as Prisma.JsonValue,
      publishAt: daysFromNow(-1, 14),
    },
  });

  await prisma.auditLog.createMany({
    data: [
      {
        churchId,
        actorUserId: userMap.get('admin@example.com')!.id,
        action: 'attendance.updated',
        entity: 'event',
        entityId: sundayService.id,
        diff: { newStatus: 'checkedIn' } as Prisma.JsonValue,
      },
      {
        churchId,
        actorUserId: userMap.get('admin@example.com')!.id,
        action: 'giving.recorded',
        entity: 'contribution',
        entityId: 'contribution-2',
        diff: { amount: 40 } as Prisma.JsonValue,
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(() => console.log('Seed completed'))
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
