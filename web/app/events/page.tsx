import { api } from '../../lib/api';
import { EventsClient } from './events-client';

export default async function EventsPage() {
  const [events, members, groups] = await Promise.all([api.events(), api.members(), api.groups()]);
  const eventsWithDownloads = events.map(event => ({
    ...event,
    attendanceCsvUrl: `/api/events/${event.id}/attendance/csv`,
  }));
  return <EventsClient events={eventsWithDownloads} members={members} groups={groups} />;
}
