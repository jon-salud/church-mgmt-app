import { AnnouncementsClient } from './announcements-client';

export default async function AnnouncementsPage() {
  // Demo data for static export
  const announcements = [
    {
      id: '1',
      title: 'Welcome New Members',
      body: 'We are excited to welcome our new members to the church family!',
      audience: 'all' as const,
      publishAt: '2024-01-10T08:00:00Z',
      reads: Array(25).fill({ userId: '1' }),
    },
    {
      id: '2',
      title: 'Community Potluck',
      body: 'Join us for our monthly community potluck this Saturday at 5 PM.',
      audience: 'all' as const,
      publishAt: '2024-01-12T14:00:00Z',
      reads: Array(18).fill({ userId: '1' }),
    },
  ];

  const groups = [
    { id: '1', name: 'Worship Team', type: 'ServiceMinistry' },
    { id: '2', name: 'Youth Ministry', type: 'ServiceMinistry' },
  ];

  return <AnnouncementsClient announcements={announcements} groups={groups} />;
}
