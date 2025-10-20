import { api } from '@/lib/api.server';
import { PrayerRequest } from '@/lib/types';
import { PrayerWallClientPage } from './client-page';

export default async function PrayerWallPage() {
  const prayerRequests: PrayerRequest[] = await api.get('/prayer-requests');

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Public Prayer Wall</h1>
      <PrayerWallClientPage prayerRequests={prayerRequests} />
    </div>
  );
}
