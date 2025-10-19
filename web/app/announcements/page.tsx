import { api } from '../../lib/api.server';
import { AnnouncementsClient } from './announcements-client';

export default async function AnnouncementsPage() {
  const [announcements, groups] = await Promise.all([api.announcements(), api.groups()]);
  return <AnnouncementsClient announcements={announcements} groups={groups} />;
}
