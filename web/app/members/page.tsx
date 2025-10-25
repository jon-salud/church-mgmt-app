import { MembersClient } from './members-client';

export default async function MembersPage() {
  // Demo data for static export
  const members = [
    {
      id: '1',
      primaryEmail: 'john.doe@example.com',
      status: 'active' as const,
      profile: {
        firstName: 'John',
        lastName: 'Doe',
        phone: '555-0101',
      },
      groups: [{ id: '1', name: 'Worship Team' }],
    },
    {
      id: '2',
      primaryEmail: 'jane.smith@example.com',
      status: 'active' as const,
      profile: {
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '555-0102',
      },
      groups: [{ id: '2', name: 'Youth Ministry' }],
    },
  ];

  const roles = [
    {
      id: 'admin',
      name: 'Admin',
      slug: 'admin',
    },
    {
      id: 'member',
      name: 'Member',
      slug: 'member',
    },
  ];

  return <MembersClient members={members} roles={roles} initialQuery="" />;
}
