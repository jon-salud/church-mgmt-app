import { Metadata } from 'next';
import { api } from '@/lib/api.server';
import { PrayerRequest } from '@/lib/types';
import { PrayerAdminClientPage } from './client-page';

export const metadata: Metadata = {
  title: 'Prayer Request Moderation',
};

export default async function PrayerAdminPage() {
  const prayerRequests: PrayerRequest[] = await api.get('/prayer/pending');

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Prayer Request Moderation</h1>
      <PrayerAdminClientPage prayerRequests={prayerRequests} />
    </div>
  );
}
