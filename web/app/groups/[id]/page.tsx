import { notFound } from 'next/navigation';
import { GroupDetailClient } from './group-detail-client';

interface GroupDetailProps {
  params: { id: string };
}

export async function generateStaticParams() {
  // For static export, we need to provide all possible group IDs
  // In a real deployment, this would fetch from your database
  // For now, we'll provide some placeholder IDs based on common group structures
  return [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }];
}

export default async function GroupDetailPage({ params }: GroupDetailProps) {
  // Demo data for static export
  const demoGroups = {
    '1': {
      id: '1',
      name: 'Worship Team',
      type: 'ServiceMinistry' as const,
      description: 'Leading worship services and music ministry',
      memberCount: 12,
      members: [
        {
          userId: '1',
          role: 'Leader',
          status: 'active' as const,
          joinedAt: '2023-01-15T00:00:00Z',
          user: {
            id: '1',
            primaryEmail: 'john.doe@example.com',
            profile: { firstName: 'John', lastName: 'Doe' },
          },
        },
        {
          userId: '2',
          role: 'Member',
          status: 'active' as const,
          joinedAt: '2023-03-01T00:00:00Z',
          user: {
            id: '2',
            primaryEmail: 'jane.smith@example.com',
            profile: { firstName: 'Jane', lastName: 'Smith' },
          },
        },
      ],
    },
    '2': {
      id: '2',
      name: 'Youth Group',
      type: 'SmallGroup' as const,
      description: 'Ministry for teenagers and young adults',
      memberCount: 25,
      members: [
        {
          userId: '3',
          role: 'Leader',
          status: 'active' as const,
          joinedAt: '2023-02-10T00:00:00Z',
          user: {
            id: '3',
            primaryEmail: 'bob.johnson@example.com',
            profile: { firstName: 'Bob', lastName: 'Johnson' },
          },
        },
      ],
    },
    '3': {
      id: '3',
      name: 'Outreach Committee',
      type: 'VolunteerTeam' as const,
      description: 'Community outreach and service projects',
      memberCount: 8,
      members: [],
    },
    '4': {
      id: '4',
      name: 'Prayer Ministry',
      type: 'ServiceMinistry' as const,
      description: 'Prayer support and intercession',
      memberCount: 15,
      members: [],
    },
    '5': {
      id: '5',
      name: "Children's Ministry",
      type: 'ServiceMinistry' as const,
      description: "Sunday school and children's programs",
      memberCount: 20,
      members: [],
    },
  };

  const group = demoGroups[params.id as keyof typeof demoGroups];
  if (!group) {
    notFound();
  }

  // Demo data for all members
  const members = [
    {
      id: '1',
      primaryEmail: 'john.doe@example.com',
      profile: { firstName: 'John', lastName: 'Doe' },
    },
    {
      id: '2',
      primaryEmail: 'jane.smith@example.com',
      profile: { firstName: 'Jane', lastName: 'Smith' },
    },
    {
      id: '3',
      primaryEmail: 'bob.johnson@example.com',
      profile: { firstName: 'Bob', lastName: 'Johnson' },
    },
  ];

  return <GroupDetailClient group={group} allMembers={members} />;
}
