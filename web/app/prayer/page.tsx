import { api } from '@/lib/api.server';
import { PrayerRequest } from '@/lib/types';
import { PrayerWallClientPage } from './client-page';

export default async function PrayerWallPage() {
  const prayerRequests: PrayerRequest[] = await api.getPrayerRequests();

  return (
    <div className="p-4">
      <h1 className="heading-1 mb-4">Public Prayer Wall</h1>
      <PrayerWallClientPage prayerRequests={prayerRequests} />
    </div>
  );
}
