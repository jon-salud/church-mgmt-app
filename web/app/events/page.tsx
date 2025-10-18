import { api } from '../../lib/api';
import { EventsClient } from './events-client';

export default async function EventsPage() {
  const [events, members, groups] = await Promise.all([api.events(), api.members(), api.groups()]);
  return <EventsClient events={events} members={members} groups={groups} />;
}
