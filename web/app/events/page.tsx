import { EventsClient } from './events-client';

export default async function EventsPage() {
  // Demo data for static export
  const events = [
    {
      id: '1',
      title: 'Sunday Service',
      description: 'Weekly worship service',
      startAt: '2024-01-14T10:00:00Z',
      endAt: '2024-01-14T11:30:00Z',
      location: 'Main Sanctuary',
      groupId: null,
      attendanceCount: 45,
      capacity: 100,
      attendance: [
        { userId: '1', status: 'present' },
        { userId: '2', status: 'present' },
      ],
    },
    {
      id: '2',
      title: 'Youth Group',
      description: 'Weekly youth meeting',
      startAt: '2024-01-16T18:00:00Z',
      endAt: '2024-01-16T20:00:00Z',
      location: 'Youth Room',
      groupId: '2',
      attendanceCount: 12,
      capacity: 25,
      attendance: [{ userId: '3', status: 'present' }],
    },
  ];

  const members = [
    { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
    { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
  ];

  const groups = [
    { id: '1', name: 'Worship Team', type: 'ServiceMinistry' },
    { id: '2', name: 'Youth Ministry', type: 'ServiceMinistry' },
  ];

  const eventsWithDownloads = events.map(event => ({
    ...event,
    attendanceCsvUrl: `/api/events/${event.id}/attendance/csv`,
  }));

  return <EventsClient events={eventsWithDownloads} members={members} groups={groups} />;
}
