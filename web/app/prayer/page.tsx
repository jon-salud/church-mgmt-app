import { PrayerRequest } from '@/lib/types';
import { PrayerWallClientPage } from './client-page';

export default async function PrayerWallPage() {
  // Demo data for static export
  const prayerRequests: PrayerRequest[] = [
    {
      id: '1',
      title: 'Healing for Family',
      description: 'Please pray for my mother who is recovering from surgery.',
      prayerCount: 12,
    },
    {
      id: '2',
      title: 'Guidance for Career',
      description: 'Seeking wisdom for an important career decision.',
      prayerCount: 8,
    },
    {
      id: '3',
      title: 'Strength for Students',
      description: 'Prayers for students preparing for final exams.',
      prayerCount: 15,
    },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Public Prayer Wall</h1>
      <PrayerWallClientPage prayerRequests={prayerRequests} />
    </div>
  );
}
