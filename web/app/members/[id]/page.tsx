import { notFound } from 'next/navigation';
import { MemberDetailClient } from './member-detail-client';
import { PrayerRequest } from '../../../lib/types';

interface MemberDetailProps {
  params: { id: string };
}

export async function generateStaticParams() {
  // For static export, we need to provide all possible member IDs
  // In a real deployment, this would fetch from your database
  return [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }];
}

export default async function MemberDetailPage({ params }: MemberDetailProps) {
  // Demo data for static export
  const demoMembers = {
    '1': {
      id: '1',
      primaryEmail: 'john.doe@example.com',
      profile: {
        firstName: 'John',
        lastName: 'Doe',
        phone: '555-0123',
        address: '123 Main St',
        joinDate: '2023-01-15T00:00:00Z',
        baptismDate: '2023-02-20T00:00:00Z',
      },
      status: 'active' as const,
      createdAt: '2023-01-15T00:00:00Z',
      groups: [{ id: '1', name: 'Worship Team', role: 'Leader' }],
      household: { id: '1', name: 'Smith Family' },
    },
    '2': {
      id: '2',
      primaryEmail: 'jane.smith@example.com',
      profile: {
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '555-0456',
        address: '123 Main St',
        joinDate: '2023-03-01T00:00:00Z',
        baptismDate: '2023-04-15T00:00:00Z',
      },
      status: 'active' as const,
      createdAt: '2023-03-01T00:00:00Z',
      groups: [{ id: '1', name: 'Worship Team', role: 'Member' }],
      household: { id: '1', name: 'Smith Family' },
    },
    '3': {
      id: '3',
      primaryEmail: 'bob.johnson@example.com',
      profile: {
        firstName: 'Bob',
        lastName: 'Johnson',
        phone: '555-0789',
        address: '456 Oak Ave',
        joinDate: '2023-02-10T00:00:00Z',
        baptismDate: '2023-03-25T00:00:00Z',
      },
      status: 'active' as const,
      createdAt: '2023-02-10T00:00:00Z',
      groups: [{ id: '2', name: 'Youth Group', role: 'Leader' }],
      household: { id: '2', name: 'Johnson Family' },
    },
    '4': {
      id: '4',
      primaryEmail: 'alice.davis@example.com',
      profile: {
        firstName: 'Alice',
        lastName: 'Davis',
        phone: '555-0321',
        address: '789 Pine Rd',
        joinDate: '2023-04-05T00:00:00Z',
        baptismDate: '2023-05-20T00:00:00Z',
      },
      status: 'active' as const,
      createdAt: '2023-04-05T00:00:00Z',
      groups: [],
      household: { id: '3', name: 'Davis Family' },
    },
    '5': {
      id: '5',
      primaryEmail: 'charlie.davis@example.com',
      profile: {
        firstName: 'Charlie',
        lastName: 'Davis',
        phone: '555-0654',
        address: '789 Pine Rd',
        joinDate: '2023-05-10T00:00:00Z',
        baptismDate: '2023-06-15T00:00:00Z',
      },
      status: 'active' as const,
      createdAt: '2023-05-10T00:00:00Z',
      groups: [],
      household: { id: '3', name: 'Davis Family' },
    },
  };

  const demoRoles = [
    { id: 'admin', name: 'Admin', permissions: ['*'], isSystem: true },
    { id: 'member', name: 'Member', permissions: ['read'], isSystem: true },
  ];

  const member = demoMembers[params.id as keyof typeof demoMembers];
  const roles = demoRoles;

  if (!member) {
    notFound();
  }

  // For static export, we can't use authentication-dependent features
  // Remove user-specific data that requires cookies
  const settings = null; // Would normally fetch based on churchId from currentUser
  const children = member.household?.id ? [] : []; // Would normally fetch children from household
  const prayerRequests: PrayerRequest[] = []; // Would normally only show for own profile

  return (
    <MemberDetailClient
      member={member}
      roles={roles}
      settings={settings}
      children={children}
      prayerRequests={prayerRequests}
    />
  );
}
